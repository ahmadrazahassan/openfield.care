// Assets imported outside the output/imagegen pipeline.
// Kept separate so regenerating the pipeline cannot silently drop them.
// Merged into the registry by src/content/assets.ts.

export const localImageMetadata = {
  "/images/hero/hero-field-aerial.jpg": {
    "path": "/images/hero/hero-field-aerial.jpg",
    "width": 2000,
    "height": 1125,
    "alt": "An aerial view of a person lying spread out in the middle of a vast green field.",
    "placeholder": false,
    "blurDataURL": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIF/8QAGRABAQEAAwAAAAAAAAAAAAAAAQARIUGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDLEXmOa0k79pBP/9k="
  },
  "/images/hero/hero-field-aerial-mobile.jpg": {
    "path": "/images/hero/hero-field-aerial-mobile.jpg",
    "width": 900,
    "height": 1200,
    "alt": "An aerial view of a person lying spread out in the middle of a vast green field.",
    "placeholder": false,
    "blurDataURL": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAVABADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAQACBf/EABwQAQACAgMBAAAAAAAAAAAAAAEAAhEhA0FRof/EABYBAQEBAAAAAAAAAAAAAAAAAAEDBP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOWbjbwjx2K8lVqWOx7hdxnGl+TIkyONwVySlEv/2Q=="
  }
} as const;
