pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                echo 'Cloning...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '/usr/bin/npm install'
            }
        }

        stage('Stop Old App') {
            steps {
                sh 'pkill -f "node server.js" || true'
            }
        }

        stage('Deploy') {
            steps {
                sh 'nohup /usr/bin/node server.js > /tmp/app.log 2>&1 &'
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Deployment Failed!'
        }
    }
}
