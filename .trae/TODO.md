# TODO:

- [x] remove-nickname-schema: 从userProfiles表中移除nickname字段，更新数据库schema (priority: High)
- [x] update-set-password-page: 修改set-password页面，添加姓名和性别字段的输入 (priority: High)
- [x] update-set-password-api: 更新set-password API，处理姓名和性别字段 (priority: High)
- [x] create-migration: 创建数据库迁移文件移除nickname字段 (priority: High)
- [x] update-queries: 更新所有查询函数，移除nickname相关逻辑 (priority: Medium)
- [x] update-frontend-components: 更新前端组件，移除nickname显示，使用真实姓名 (priority: Medium)
- [x] test-changes: 测试所有修改，确保功能正常 (priority: Medium)
- [ ] commit-changes: 提交所有更改到dev分支 (**IN PROGRESS**) (priority: Low)
