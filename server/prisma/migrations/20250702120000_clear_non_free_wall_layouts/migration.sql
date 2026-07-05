-- Clear layout coordinates for board types that position posts on the client only.
UPDATE "Post" AS p
SET "data_layout" = NULL
FROM "Padlet" AS pad
WHERE p."padlet_id" = pad."padlet_id"
  AND pad."board_type" <> 'free_wall';
