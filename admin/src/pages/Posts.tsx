import ResourceCrud from '../components/ResourceCrud';

export default function Posts() {
  return (
    <ResourceCrud
      title="Blog Posts"
      endpoint="/posts"
      listEndpoint="/posts/admin"
      columns={['title', 'slug', 'status']}
      defaultValues={{ status: 'draft' }}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug (URL-friendly)', required: true },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { name: 'content', label: 'Content (HTML)', type: 'textarea', required: true },
        { name: 'featured_image', label: 'Featured Image', type: 'image' },
        { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
        { name: 'published_at', label: 'Published At (YYYY-MM-DD HH:MM:SS)' },
      ]}
    />
  );
}
