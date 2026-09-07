type EditorialEntry = {
  data: {
    status: 'draft' | 'review' | 'published';
  };
};

export function isVisibleContent(entry: EditorialEntry) {
  return import.meta.env.DEV || entry.data.status === 'published';
}
