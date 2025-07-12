<template>
  <el-row class="project-tree">
    <div class="head-container">
      <el-input
        v-model="projectName"
        :placeholder="$t('input.tips.projectName')"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        style="margin-bottom: 20px"
      />
    </div>
    <div class="head-container">
      <el-tree
        ref="tree"
        :data="projects"
        :expand-on-click-node="false"
        :filter-node-method="filterProjects"
        default-expand-all
        :props="{ label: 'label' }"
        :render-content="renderProjectNode"
        @node-click="handleProjectClick"
      />
    </div>
  </el-row>
</template>

<script>
import { getUserTenantProjects } from '@/api/upms/user'
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      projectName: '',
      projects: []
    }
  },
  computed: {
    tenant: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    tenant(nv, ov) {
      console.log(nv, ov)
    },
    projectName(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    filterProjects(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleProjectClick(data) {
      this.$emit('change', data.value)
      // this.projects = data.value
      // this.fetchData()
    },
    renderProjectNode(h, { node, data, store }) {
      // 创建label节点
      const labelVNode = h(
        'span',
        {
          class: 'el-tree-node__label',
          style: {
            display: 'inline-block',
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle'
          },
          ref: 'labelSpan',
          refInFor: true
        },
        data.label
      )

      // 用一个div包裹，等渲染后判断是否溢出
      return h(
        'div',
        {
          style: { display: 'inline-block', width: '100%' },
          ref: 'labelWrapper',
          refInFor: true,
          on: {
            mouseenter: (e) => {
              // 动态判断是否溢出
              const span = e.currentTarget.querySelector('.el-tree-node__label')
              if (span && span.scrollWidth > span.clientWidth) {
                this.$set(data, '_showTooltip', true)
              } else {
                this.$set(data, '_showTooltip', false)
              }
            }
          }
        },
        [
          (data._showTooltip
            ? h(
              'el-tooltip',
              {
                props: {
                  content: data.label,
                  placement: 'right',
                  effect: 'dark'
                }
              },
              [labelVNode]
            )
            : labelVNode)
        ]
      )
    },
    loadData() {
      const tenant = this.$store.getters.tenant
      if (tenant && tenant.id) {
        getUserTenantProjects(tenant.id).then((resp) => {
          if (resp.success) {
            this.projects = resp.rows
          }
        })
      }
    },
    selectNamespace(val) {
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-menu-namespace .el-menu-item {
    padding: 0 10px;
    height: 50px;
    line-height: 50px;
  }
  .tenant-space {
    margin-bottom: 10px;
  }
  .el-tree {
    .el-tree-node {
      padding: 5px 5px !important;
    }
  }
</style>
<style>
  .project-tree .el-tree-node {
    padding: 5px 5px;
    border: 1px solid;
    margin: 5px;
    border-radius: 5px;
  }
  .project-tree .el-tree-node__content {
    padding: 5px 5px;
  }
  .project-tree .is-current {
    color: #409eff;
  }
  .project-tree .el-tree-node__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /*width:200px;*/
    margin: 0px 0px;
    text-align: left;
  }
</style>
