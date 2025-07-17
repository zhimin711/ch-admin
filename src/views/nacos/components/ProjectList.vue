<template>
  <div class="project-list">
    <!-- 搜索输入框 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入项目名称"
        clearable
        size="small"
        prefix-icon="el-icon-search"
      />
    </div>
    <!-- 项目列表 -->
    <div class="list-container">
      <div
        v-for="project in filteredProjects"
        :key="project.value"
        class="project-item"
        :class="{ 'project-item--active': selectedProject === project.value }"
        @click="handleProjectClick(project)"
      >
        <span class="project-name">{{ project.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserTenantProjects } from '@/api/upms/user'

export default {
  name: 'ProjectList',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchKeyword: '',
      projects: [],
      selectedProject: ''
    }
  },
  computed: {
    filteredProjects() {
      if (!this.searchKeyword) {
        return this.projects
      }
      return this.projects.filter(project =>
        project.label && project.label.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.selectedProject = newVal
      },
      immediate: true
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    handleProjectClick(project) {
      this.selectedProject = project.value
      this.$emit('input', project.value)
      this.$emit('change', project.value)
    },
    loadData() {
      const tenant = this.$store.getters.tenant
      if (tenant && tenant.id) {
        getUserTenantProjects(tenant.id).then((resp) => {
          if (resp.success) {
            this.projects = resp.rows || []
          }
        }).catch(error => {
          console.error('加载项目列表失败:', error)
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.project-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  .search-container {
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }
  .list-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0 10px 0;
    .project-item {
      display: block;
      width: 100%;
      padding: 12px 0;
      margin-bottom: 8px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      font-size: 15px;
      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }
      &.project-item--active {
        background-color: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
        font-weight: 500;
      }
      .project-name {
        display: block;
        font-size: 14px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.list-container::-webkit-scrollbar {
  width: 6px;
}
.list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
</style>
