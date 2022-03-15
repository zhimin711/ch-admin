import Vue from 'vue'
import DataDict from '@/utils/dict'
import { searchDict } from '@/api/upms/dict'

function install() {
  Vue.use(DataDict, {
    metas: {
      '*': {
        labelField: 'label',
        valueField: 'value',
        request(dictMeta) {
          return searchDict(dictMeta.type).then(resp => resp.rows)
        }
      }
    }
  })
}

export default {
  install
}
