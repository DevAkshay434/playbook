import { WPPage } from "./types";
import { convert } from "html-to-text";

export function mapWPPageToArticle(page: WPPage) {
  const contentHtml = page.content?.rendered || "";
  const excerptHtml = page.excerpt?.rendered || "";
  
  // Create clean plain-text content for searching
  const contentText = convert(contentHtml, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
      { selector: 'script', format: 'skip' },
      { selector: 'style', format: 'skip' }
    ]
  });

  const excerptText = convert(excerptHtml, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  });

  return {
    externalId: page.id.toString(),
    source: "wordpress",
    slug: page.slug,
    title: page.title?.rendered || "Untitled",
    excerpt: excerptText || null,
    contentText: contentText,
    contentHtml: contentHtml,
    url: page.link,
    wordpressModifiedAt: new Date(page.modified),
    active: true,
  };
}
