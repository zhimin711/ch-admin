<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Activity" name="activity">
                <activity />
              </el-tab-pane>
              <el-tab-pane label="Timeline" name="timeline">
                <timeline />
              </el-tab-pane>
              <el-tab-pane label="个人信息" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="password">
                <password />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Activity from './components/Activity'
import Timeline from './components/Timeline'
import Account from './components/Account'
import Password from './components/Password'

export default {
  name: 'Profile',
  components: { UserCard, Activity, Timeline, Account, Password },
  data() {
    return {
      user: {},
      activeTab: 'activity'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'role',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      const role = this.roles.find(item => this.role.id === item.id)
      this.user = {
        name: this.name,
        roles: this.roles,
        role: role,
        roleId: this.role.id,
        email: 'admin@test.com',
        avatar: this.avatar
      }
    }
  }
}
</script>
