import { renderToString } from "react-dom/server";

import App, {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  getSeoData,
} from "./App.jsx";

export function render(locationPath) {
  const seo = getSeoData(locationPath);

  return {
    html: renderToString(<App initialPath={locationPath} />),
    jsonLd: [buildOrganizationJsonLd(), buildWebsiteJsonLd(), ...seo.pageJsonLd],
    seo,
  };
}
