

```

def label = "jnlp-slave-${JOB_NAME}"
def app_name = "ch-admin"
def img_name = "ch-admin:${DATETIME}"
def docker_api = "-H tcp://192.168.0.253:2375"
// def hub_addr = "192.168.0.253:8083"
def hub_addr = "registry.kubeoperator.io:8083"
def hub_namespace = "ch"
def k8s_url = "https://192.168.0.252:8443"

podTemplate(label: label, cloud: 'kubernetes', inheritFrom: 'jenkins-slave-nodejs') {
    node(label) {
            stage('Checkout Project') {
                echo "=====================1.Clone Project====================="
                git credentialsId: 'CHGitee2', url: 'https://gitee.com/ch-cloud/ch-admin2.git/', branch: "${params.BRANCH}"
            }
            stage('Build project') {
                container('node') {
                    echo "=====================2.Build Project Deploy Package File====================="
                    // sh 'apk update && apk add git'
                    // sh 'git config --global http.sslVerify false'
                    // sh 'git config --global url."https://".insteadOf ssh://git@'
                    // sh 'npm install resolve-npm-git  --registry=http://192.168.0.253:8081/repository/npm-public/'
                    // sh 'npm install -g cnpm --registry=http://192.168.0.253:8081/repository/npm-public/'
                    // sh 'npm install --registry=http://192.168.0.253:8081/repository/npm-public/'
                    sh 'yarn config set registry http://192.168.0.253:8081/repository/npm-public/'
                    sh 'yarn install'
                    // sh 'yarn add tui-editor'
                    // sh 'npm install --registry=http://192.168.0.253:8081/repository/npm-public/'
                    sh 'yarn run build:prod'
                }
            }
            stage('Build Image') {
                echo "=====================3.Build Project Docker Image====================="
                // sh "cp src/main/docker/Dockerfile ${WORKSPACE}/build/libs"
                container('docker') {
                    sh "docker ${docker_api} build -t ${img_name} -f ${WORKSPACE}/build/Dockerfile ${WORKSPACE}/dist"
                    sh "docker ${docker_api} tag ${img_name} ${hub_addr}/${hub_namespace}/${img_name}"
                }

            }
            stage('Push Image') {
                echo "=====================4.Push Project Docker Image====================="
                container('docker')  {
                    withCredentials([usernamePassword(credentialsId: 'Nexus', passwordVariable: 'dockerPassword', usernameVariable: 'dockerUser')]) {
                        sh "docker ${docker_api} login -u ${dockerUser} -p ${dockerPassword} ${hub_addr}"
                        sh "docker ${docker_api} push ${hub_addr}/${hub_namespace}/${img_name}"
                        sh "docker ${docker_api} rmi ${hub_addr}/${hub_namespace}/${img_name} ${img_name}"
                    }
                }
            }
            stage('Deploy Image') {
                echo "=====================5.Deploy Project Docker Image====================="
                container ('docker') {
                    sh "cd ${WORKSPACE}"
                    script{
                        out=sh(script:"ls ./kubectl",returnStatus:true)
                        println "--------------"
                        println out
                        if(out == 0){
                            println "file is exist" 
                        } else if(out == 1 || out == 2){
                            println "file is not exist"
                            sh 'curl -LO "https://storage.googleapis.com/kubernetes-release/release/v1.20.5/bin/linux/amd64/kubectl"'
                            sh 'chmod u+x ./kubectl'
                        }else{
                            error("command is error,please check")
                        }
                    }
                    withKubeConfig([credentialsId:'kubeMaster'
                                    ,serverUrl: "${k8s_url}"
                                    ,namespace: "ch"]) {
                        sh "./kubectl set image deployment/${app_name} *=${hub_addr}/${hub_namespace}/${img_name}"
                    }
                }
            }
    }
}
```

```
pipeline {
    agent any

    environment {
        APP_NAME = "ch-admin"
        IMG_NAMESPACE = "ch-cloud"
        HUB_ADDR = "registry.cn-hangzhou.aliyuncs.com"
        DATETIME = "${new Date().format('yyyyMMddHHmmss')}"
        IMG_NAME = "${APP_NAME}:${DATETIME}"
    }

    parameters {
        gitParameter name: 'BRANCH', type: 'PT_BRANCH', defaultValue: 'master', branchFilter: 'origin/(.*)'
    }

    tools {
        nodejs 'Node18' // Jenkins中你预设的Node.js环境名
    }

    stages {
        stage('Checkout Project') {
            steps {
                echo "=====================1. Clone Project====================="
                git credentialsId: 'CHGitee', url: 'https://gitee.com/ch-cloud/ch-admin2.git', branch: "${params.BRANCH}"
            }
        }

        stage('Build Frontend') {
            steps {
                echo "=====================2. Build Vue Project====================="
                // sh 'yarn config set registry http://192.168.0.253:8081/repository/npm-public/'
                sh 'yarn install'
                sh 'yarn run build:prod'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "=====================3. Build Docker Image====================="
                sh "docker build -t ${IMG_NAME} -f build/Dockerfile dist"
                sh "docker tag ${IMG_NAME} ${HUB_ADDR}/${IMG_NAMESPACE}/${IMG_NAME}"
            }
        }

        stage('Push Image') {
            steps {
                echo "=====================4. Push Docker Image====================="
                withCredentials([usernamePassword(credentialsId: 'ali-repo', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin ${HUB_ADDR}
                        docker push ${HUB_ADDR}/${IMG_NAMESPACE}/${IMG_NAME}
                        docker rmi ${HUB_ADDR}/${IMG_NAMESPACE}/${IMG_NAME} ${IMG_NAME}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ 构建发布成功'
        }
        failure {
            echo '❌ 构建发布失败，请检查日志'
        }
    }
}

```