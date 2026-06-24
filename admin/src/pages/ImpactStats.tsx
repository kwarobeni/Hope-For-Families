import ResourceCrud from '../components/ResourceCrud';

export default function ImpactStats() {
  return (
    <ResourceCrud
      title="Impact Stats"
      endpoint="/impact-stats"
      columns={['label', 'value']}
      fields={[
        { name: 'label', label: 'Label (e.g. Families Supported)', required: true },
        { name: 'value', label: 'Value', type: 'number', required: true },
        { name: 'sort_order', label: 'Sort Order', type: 'number' },
      ]}
    />
  );
}
