const { crudRouter } = require('../utils/crudFactory');

module.exports = crudRouter({
  table: 'impact_stats',
  columns: ['label', 'value', 'manual_override', 'sort_order'],
  orderBy: 'sort_order ASC',
});
