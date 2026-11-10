# 제미씨 character integration

Name: 제미씨. The user corrected 재미 to 제미 on 2026-11-10; use 제미씨 in all visible copy and alt text.

The owner's supplied reference sheet is the character identity. Three transparent derivative cutouts preserve its black hand-drawn lines, white interiors, proportions and expressions. They were prepared with the built-in image tool and resized for the web. Do not substitute a vector redraw or unrelated mascot.

Placements:
- Homepage: pen-holding full figure, adjacent to the existing introduction.
- Archive cards, insight rows, search results, detailed notes and their modal: small face with '제미씨의 기록'. Existing quote/source attribution remains unchanged.
- Empty search: thinking pose and '다른 단어로 찾아볼까요?'. It must disappear as soon as results return.
- Favicon: face PNG at 64px; legacy favicon.svg wraps the same face. Local layout also supplies a 192px touch icon.

Versioned image files are in public/character. The source theme is now public/design/site-20261110-character.css and .js. Keep the older theme files for previously cached pages. Regenerate src/generated/site-design.mjs through the existing build hook; it embeds character images so release can preserve the remote asset collection.

Worker insertion and client bylines must be idempotent. Keep the current HANAM direct access, localStorage keys, existing document content, historical-file fallback and quotation print styles. Character decorations are hidden on print.
