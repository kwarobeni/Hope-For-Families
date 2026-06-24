const { crudRouter } = require('../utils/crudFactory');

module.exports = crudRouter({
  table: 'testimonials',
  columns: ['name', 'category', 'content', 'image', 'is_featured', 'sort_order'],
  orderBy: 'sort_order ASC',
});
