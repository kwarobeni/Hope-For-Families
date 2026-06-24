import ResourceCrud from '../components/ResourceCrud';

export default function Initiatives() {
  return (
    <ResourceCrud
      title="Initiatives"
      endpoint="/initiatives"
      columns={['title', 'slug', 'tagline']}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug (URL-friendly)', required: true },
        { name: 'tagline', label: 'Tagline' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Image', type: 'image' },
        { name: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
