def getTagOrCommit () {
  return sh(
    returnStdout: true,
    script: 'git describe --exact 2>/dev/null || git rev-parse --short=10 HEAD'
  ).trim()
}

pipeline {
  agent {
    label 'some-agent-selector'
  }

  environment {
    CI = true
    BUILD_VERSION = getTagOrCommit()
  }

  stages {
    stage('install-test-build') {
      steps {
        sh "docker build -t example/app:$BUILD_VERSION ."
      }
    }

    stage('publish-images') {
      steps {
        // you'll probably need to use withCredentials here and provide
        // creds for your registry in the script
        sh "docker push example/app:$BUILD_VERSION"
        sh "docker rmi -f example/app:$BUILD_VERSION"
      }
    }
  }

  post {
    failure {
      notifySlack()
    }
  }
}

// it's the 21st century! everyone is on slack!
def notifySlack () {
  def colorCode = '#FF0000'
  def channelName = '#some-slack-channel'
  def details = """FAILED: Job ${env.JOB_NAME} ${env.BUILD_NUMBER}
  Check console output at ${env.BUILD_URL}"""

  slackSend (color: colorCode, message: details, channel: channelName )
}
