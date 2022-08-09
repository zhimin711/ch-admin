<template>
  <div class="code-editor">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Java" name="1" />
      <el-tab-pane label="Spring" name="8" />
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
import _CodeMirror from 'codemirror'
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

const nodejsCode = 'TODO'
const cppCode = 'TODO'
const shellCode = 'TODO'
const pythonCode = 'TODO'
const CodeMirror = window.CodeMirror || _CodeMirror
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
        this.editor.setValue(this.getSpringBootCode(this.value))
      } else if (this.activeName === '3') {
        this.editor.setValue(this.getSpringCloudCode(this.value))
      } else if (this.activeName === '4') {
        this.editor.setValue(nodejsCode)
      } else if (this.activeName === '5') {
        this.editor.setValue(cppCode)
      } else if (this.activeName === '6') {
        this.editor.setValue(shellCode)
      } else if (this.activeName === '7') {
        this.editor.setValue(pythonCode)
      } else if (this.activeName === '8') {
        this.editor.setValue(this.getSpringCode(this.value))
      }
    },
    getJavaCode(data) {
      return `/* Refer to document: https://github.com/alibaba/nacos/blob/master/example/src/main/java/com/alibaba/nacos/example
*  pom.xml
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>$\{latest.version}</version>
    </dependency>
*/
package com.alibaba.nacos.example;

import java.util.Properties;

import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.naming.NamingFactory;
import com.alibaba.nacos.api.naming.NamingService;
import com.alibaba.nacos.api.naming.listener.Event;
import com.alibaba.nacos.api.naming.listener.EventListener;
import com.alibaba.nacos.api.naming.listener.NamingEvent;

/**
 * @author Nacos
 */
public class NamingExample {

    public static void main(String[] args) throws NacosException {

        Properties properties = new Properties();
        properties.setProperty("serverAddr", System.getProperty("serverAddr"));
        properties.setProperty("namespace", System.getProperty("namespace"));

        NamingService naming = NamingFactory.createNamingService(properties);

        naming.registerInstance("${data.name}", "11.11.11.11", 8888, "TEST1");

        naming.registerInstance("${data.name}", "2.2.2.2", 9999, "DEFAULT");

        System.out.println(naming.getAllInstances("${data.name}"));

        naming.deregisterInstance("${data.name}", "2.2.2.2", 9999, "DEFAULT");

        System.out.println(naming.getAllInstances("${data.name}"));

        naming.subscribe("${data.name}", new EventListener() {
            @Override
            public void onEvent(Event event) {
                System.out.println(((NamingEvent)event).getServiceName());
                System.out.println(((NamingEvent)event).getInstances());
            }
        });
    }
}`
    },

    getSpringCode(data) {
      return `/* Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-example/nacos-spring-discovery-example
*  pom.xml
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-spring-context</artifactId>
        <version>\${latest.version}</version>
    </dependency>
*/

// Refer to document:  https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-example/nacos-spring-discovery-example/src/main/java/com/alibaba/nacos/example/spring
package com.alibaba.nacos.example.spring;

import com.alibaba.nacos.api.annotation.NacosProperties;
import com.alibaba.nacos.spring.context.annotation.discovery.EnableNacosDiscovery;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableNacosDiscovery(globalProperties = @NacosProperties(serverAddr = "127.0.0.1:8848"))
public class NacosConfiguration {

}

// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-example/nacos-spring-discovery-example/src/main/java/com/alibaba/nacos/example/spring/controller
package com.alibaba.nacos.example.spring.controller;

import com.alibaba.nacos.api.annotation.NacosInjected;
import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.naming.NamingService;
import com.alibaba.nacos.api.naming.pojo.Instance;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

@Controller
@RequestMapping("discovery")
public class DiscoveryController {

    @NacosInjected
    private NamingService namingService;

    @RequestMapping(value = "/get", method = GET)
    @ResponseBody
    public List<Instance> get(@RequestParam String serviceName) throws NacosException {
        return namingService.getAllInstances(serviceName);
    }
}`
    },

    getSpringBootCode(data) {
      return `/* Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example
*  pom.xml
    <dependency>
       <groupId>com.alibaba.boot</groupId>
       <artifactId>nacos-discovery-spring-boot-starter</artifactId>
       <version>\${latest.version}</version>
    </dependency>
*/
/* Refer to document:  https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example/src/main/resources
* application.properties
   nacos.discovery.server-addr=127.0.0.1:8848
*/
// Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example/src/main/java/com/alibaba/nacos/example/spring/boot/controller

package com.alibaba.nacos.example.spring.boot.controller;

import com.alibaba.nacos.api.annotation.NacosInjected;
import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.naming.NamingService;
import com.alibaba.nacos.api.naming.pojo.Instance;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

@Controller
@RequestMapping("discovery")
public class DiscoveryController {

    @NacosInjected
    private NamingService namingService;

    @RequestMapping(value = "/get", method = GET)
    @ResponseBody
    public List<Instance> get(@RequestParam String serviceName) throws NacosException {
        return namingService.getAllInstances(serviceName);
    }
}`
    },

    getSpringCloudCode(data) {
      return `/* Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/
*  pom.xml
    <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
       <version>\${latest.version}</version>
    </dependency>
*/

// nacos-spring-cloud-provider-example

/* Refer to document:  https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-provider-example/src/main/resources
* application.properties
server.port=18080
spring.application.name=${data.name}
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
*/

// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-provider-example/src/main/java/com/alibaba/nacos/example/spring/cloud
package com.alibaba.nacos.example.spring.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Nacos
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NacosProviderApplication {

  public static void main(String[] args) {
    SpringApplication.run(NacosProviderApplication.class, args);
}

  @RestController
  class EchoController {
    @RequestMapping(value = "/echo/{string}", method = RequestMethod.GET)
    public String echo(@PathVariable String string) {
      return "Hello Nacos Discovery " + string;
    }
  }
}

// nacos-spring-cloud-consumer-example

/* Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-consumer-example/src/main/resources
* application.properties
spring.application.name=micro-service-oauth2
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
*/

// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-consumer-example/src/main/java/com/alibaba/nacos/example/spring/cloud
package com.alibaba.nacos.example.spring.cloud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * @author Nacos
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NacosConsumerApplication {

    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosConsumerApplication.class, args);
    }

    @RestController
    public class TestController {

        private final RestTemplate restTemplate;

        @Autowired
        public TestController(RestTemplate restTemplate) {this.restTemplate = restTemplate;}

        @RequestMapping(value = "/echo/{str}", method = RequestMethod.GET)
        public String echo(@PathVariable String str) {
            return restTemplate.getForObject("http://service-provider/echo/" + str, String.class);
        }
    }
}`
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
