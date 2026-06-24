const { crudRouter } = require('../utils/crudFactory');

module.exports = crudRouter({
  table: 'resources',
  columns: ['title', 'file_url', 'category'],
  orderBy: 'category ASC, title ASC',
});
