import ResourceCrud from '../components/ResourceCrud';

export default function Testimonials() {
  return (
    <ResourceCrud
      title="Testimonials"
      endpoint="/testimonials"
      columns={['name', 'category', 'is_featured']}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'category', label: 'Category (e.g. Parent, Volunteer)' },
        { name: 'content', label: 'Testimonial', type: 'textarea', required: true },
        { name: 'image', label: 'Photo', type: 'image' },
        { name: 'is_featured', label: 'Featured on Homepage', type: 'checkbox' },
        { name: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
