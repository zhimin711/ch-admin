<template>
  <div class="code-editor">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Java" name="1" />
      <el-tab-pane label="Spring Boot" name="2" />
      <el-tab-pane label="Spring Cloud" name="3" />
      <el-tab-pane label="Node.js" name="4" />
      <el-tab-pane label="C++" name="5" />
      <el-tab-pane label="Shell" name="6" />
      <el-tab-pane label="Python" name="7" />
    </el-tabs>
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/hint/show-hint.css'
// import 'codemirror/theme/rubyblue.css'
// require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/clike/clike'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/hint/show-hint'

// const defaultCode = ''
const nodejsCode = 'TODO'
const cppCode = 'TODO'
const shellCode = 'TODO'
const pythonCode = 'TODO'

const SPRIG_BOOT_CODE = `// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-boot-example/nacos-spring-boot-config-example
package com.alibaba.nacos.example.spring.boot.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

@Controller
@RequestMapping("config")
public class ConfigController {

    @Value("\${useLocalCache:false}")
    private boolean useLocalCache;

    public void setUseLocalCache(boolean useLocalCache) {
        this.useLocalCache = useLocalCache;
    }

    @RequestMapping(value = "/get", method = GET)
    @ResponseBody
    public boolean get() {
        return useLocalCache;
    }
}`
const SPRIG_CLOUD_CODE = `// Refer to document:  https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-config-example
package com.alibaba.nacos.example.spring.cloud.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config")
@RefreshScope
public class ConfigController {

    @Value("\${useLocalCache:false}")
    private boolean useLocalCache;

    @RequestMapping("/get")
    public boolean get() {
        return useLocalCache;
    }
}`
export default {
  name: 'CodeView',
  /* eslint-disable vue/require-prop-types */
  props: ['value'],
  data() {
    return {
      editor: false,
      activeName: '1'
    }
  },
  watch: {
    value(value) {
      if (value) {
        this.editor.setValue(this.getJavaCode(value))
      }
    }
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      matchBrackets: true,
      gutters: ['CodeMirror-lint-markers'],
      // theme: 'xq-light',

      tabMode: 'indent',
      autoMatchParens: true,
      textWrapping: true,
      lint: true,
      mode: 'text/x-java',
      readOnly: true// 只读 不可修改
    })

    this.editor.setOption('mode', 'text/x-java')
    if (this.value) {
      this.editor.setValue(this.getJavaCode(this.value))
    }

    this.editor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      // this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.editor.getValue()
    },
    handleClick() {
      this.editor.setValue('')
      if (this.activeName === '1') {
        if (this.value) {
          this.editor.setValue(this.getJavaCode(this.value))
        }
      } else if (this.activeName === '2') {
        this.editor.setValue(SPRIG_BOOT_CODE)
      } else if (this.activeName === '3') {
        this.editor.setValue(SPRIG_CLOUD_CODE)
      } else if (this.activeName === '4') {
        this.editor.setValue(nodejsCode)
      } else if (this.activeName === '5') {
        this.editor.setValue(cppCode)
      } else if (this.activeName === '6') {
        this.editor.setValue(shellCode)
      } else if (this.activeName === '7') {
        this.editor.setValue(pythonCode)
      }
    },
    getJavaCode(data) {
      return `/*
* Demo for Nacos
* pom.xml
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>\${version}</version>
    </dependency>
*/
package com.alibaba.nacos.example;

import java.util.Properties;
import java.util.concurrent.Executor;
import com.alibaba.nacos.api.NacosFactory;
import com.alibaba.nacos.api.config.ConfigService;
import com.alibaba.nacos.api.config.listener.Listener;
import com.alibaba.nacos.api.exception.NacosException;

/**
 * Config service example
 *
 * @author Nacos
 *
 */
public class ConfigExample {

	public static void main(String[] args) throws NacosException, InterruptedException {
		String serverAddr = "localhost";
		String dataId = "${data.dataId}";
		String group = "${data.group}";
		Properties properties = new Properties();
		properties.put(PropertyKeyConst.SERVER_ADDR, serverAddr);
		ConfigService configService = NacosFactory.createConfigService(properties);
		String content = configService.getConfig(dataId, group, 5000);
		System.out.println(content);
		configService.addListener(dataId, group, new Listener() {
			@Override
			public void receiveConfigInfo(String configInfo) {
				System.out.println("recieve:" + configInfo);
			}

			@Override
			public Executor getExecutor() {
				return null;
			}
		});

		boolean isPublishOk = configService.publishConfig(dataId, group, "content");
		System.out.println(isPublishOk);

		Thread.sleep(3000);
		content = configService.getConfig(dataId, group, 5000);
		System.out.println(content);

		boolean isRemoveOk = configService.removeConfig(dataId, group);
		System.out.println(isRemoveOk);
		Thread.sleep(3000);

		content = configService.getConfig(dataId, group, 5000);
		System.out.println(content);
		Thread.sleep(300000);

	}
}
`
    }
  }
}
</script>

<style lang="scss" scoped>
.code-editor {
  height: 100%;
  position: relative;

  ::v-deep {
    .CodeMirror {
      height: auto;
      min-height: 300px;
    }

    .CodeMirror-scroll {
      min-height: 300px;
    }

    .cm-s-rubyblue span.cm-string {
      color: #F08047;
    }
  }
}
</style>
