"""Create a local RSA key and public X.509 certificate; never print private data.

Optional one-time provisioning helper. Requires the cryptography package.
Upload ONLY public-certificate.pem to the service account in Google Cloud.
After upload, run again with --key-id to create the private Google credential JSON.
"""
import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", required=True, type=Path)
    parser.add_argument("--key-id")
    args = parser.parse_args()
    directory = args.directory.resolve()
    repository = Path(__file__).resolve().parent.parent
    if not args.directory.is_absolute() or directory == repository or repository in directory.parents:
        raise SystemExit("Use an absolute private directory OUTSIDE the repository.")
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    private_path = directory / "private-key.pem"
    public_path = directory / "public-certificate.pem"
    credential_path = directory / "ga4-viewer.json"
    if args.key_id:
        if len(args.key_id) != 40 or any(c not in "0123456789abcdef" for c in args.key_id):
            raise SystemExit("Supply the 40-character key ID shown by Google after upload.")
        if credential_path.exists():
            raise SystemExit("Refusing to overwrite existing credentials.")
        private_key = serialization.load_pem_private_key(private_path.read_bytes(), password=None)
        certificate = x509.load_pem_x509_certificate(public_path.read_bytes())
        if private_key.public_key().public_numbers() != certificate.public_key().public_numbers():
            raise SystemExit("Private key and public certificate do not match.")
        data = {
            "type": "service_account",
            "project_id": "nth-agent-512615-d5",
            "private_key_id": args.key_id,
            "private_key": private_path.read_text(encoding="ascii"),
            "client_email": "lucky-dashboard-viewer@nth-agent-512615-d5.iam.gserviceaccount.com",
            "client_id": "103068351997726708045",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "universe_domain": "googleapis.com",
        }
        with credential_path.open("x", encoding="utf-8") as handle:
            json.dump(data, handle, indent=2)
            handle.write("\n")
        credential_path.chmod(0o600)
        print("Private reporting credential created locally. No secret content printed.")
        return
    if any(path.exists() for path in [private_path, public_path, credential_path]):
        raise SystemExit("Refusing to overwrite existing key material. Use a new private directory for rotation.")
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    now = datetime.now(timezone.utc)
    # Generic public subject: no personal/business data is placed in the certificate.
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "unused")])
    certificate = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(subject)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(minutes=5))
        .not_valid_after(now + timedelta(days=365))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .sign(key, hashes.SHA256())
    )
    with private_path.open("xb") as handle:
        handle.write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    private_path.chmod(0o600)
    with public_path.open("xb") as handle:
        handle.write(certificate.public_bytes(serialization.Encoding.PEM))
    print("RSA private key created locally. Upload ONLY public-certificate.pem.")
    print("Public certificate expires:", certificate.not_valid_after_utc.isoformat())


if __name__ == "__main__":
    main()
