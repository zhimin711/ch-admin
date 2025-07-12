<template>
  <div class="dashboard-editor-container">
    <div class="info-card">
      <div class="avatar-block">
        <pan-thumb :image="avatar" class="avatar-thumb" />
        <div class="role-badge">{{ role.code }}</div>
      </div>
      <div class="info-main">
        <div class="display_name">{{ role.name }}</div>
        <div class="dashboard-title">Editor's Dashboard</div>
      </div>
      <github-corner class="github-corner" />
    </div>
    <div class="empty-block">
      <img :src="emptyGif" class="emptyGif">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import GithubCorner from '@/components/GithubCorner'

export default {
  name: 'DashboardEditor',
  components: { PanThumb, GithubCorner },
  data() {
    return {
      emptyGif: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + this.name
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'role'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e3e3e3 100%);
  min-height: 100vh;
  padding: 40px 0 0 0;
}
.info-card {
  max-width: 700px;
  margin: 0 auto 40px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  padding: 36px 40px 36px 32px;
  position: relative;
  gap: 32px;
}
.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 12px;
}
.avatar-thumb {
  width: 90px !important;
  height: 90px !important;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(64,158,255,0.12);
  margin-bottom: 10px;
}
.role-badge {
  background: linear-gradient(90deg,#409eff 0%,#66b1ff 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
  padding: 2px 16px;
  box-shadow: 0 1px 4px rgba(64,158,255,0.08);
  margin-top: 2px;
  letter-spacing: 1px;
}
.info-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}
.display_name {
  font-size: 36px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 6px;
}
.dashboard-title {
  font-size: 26px;
  color: #409eff;
  font-weight: 600;
  letter-spacing: 1px;
}
.github-corner {
  position: absolute;
  top: 0;
  right: 0;
}
.empty-block {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
}
.emptyGif {
  display: block;
  width: 320px;
  max-width: 60vw;
  margin: 0 auto;
  filter: grayscale(0.1) brightness(1.05);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
@media (max-width: 900px) {
  .info-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 16px;
    gap: 18px;
  }
  .avatar-block {
    flex-direction: row;
    align-items: center;
    margin-right: 0;
    gap: 12px;
  }
  .info-main {
    align-items: flex-start;
  }
}
@media (max-width: 600px) {
  .dashboard-editor-container {
    padding: 10px 0 0 0;
  }
  .info-card {
    max-width: 98vw;
    padding: 12px 4vw;
  }
  .display_name {
    font-size: 22px;
  }
  .dashboard-title {
    font-size: 16px;
  }
  .emptyGif {
    width: 90vw;
    max-width: 98vw;
  }
}
</style>
