import ResourceCrud from '../components/ResourceCrud';

export default function Resources() {
  return (
    <ResourceCrud
      title="Resources & Policies"
      endpoint="/resources"
      columns={['title', 'category']}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category (e.g. Policy, Legal)' },
        { name: 'file_url', label: 'PDF File', type: 'file' },
      ]}
    />
  );
}
