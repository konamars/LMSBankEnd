node ('learnua') {
        def ECR_REPOSITORY = "815700338514.dkr.ecr.us-west-2.amazonaws.com"
        def AWS_REGION = "us-west-2"
        def k8sGitBranch = "master"
        def k8sGitUrl = "https://github.com/Kona-Digital/k8s-services.git"
        def EksCluster = "DevEnv-Cluster"
        def targetDir = "temp"
        def NameSpace = "dl-dev"
        def branchName = env.BRANCH_NAME
        def Pipeline = env.JOB_NAME.tokenize('/') as String[];
        def jobName = Pipeline[1];
        def imageTag = "${jobName}-${branchName}-${BUILD_TIMESTAMP}"
        def DockerTag = "${ECR_REPOSITORY}/${jobName}:${imageTag}"
        currentBuild.displayName = "#${jobName}-${BUILD_TIMESTAMP}"
        stage('SCM Checkout')
                {
                    println "\u001B[32m[INFO] Check out SCM"
                    def scmVars = checkout(scm)
                    env.GIT_BRANCH = scmVars.GIT_BRANCH
                }				
        try {
                timestamps {

                //Feching readable job name from jenkins job url to use later in email notification
                //jobName = env.JOB_NAME
                //jobName = jobName[0..jobName.indexOf("/")-1]
                //jobName = jobName.replaceAll("%2F", "/")

                stage('K8 Checkout') {
                    println "\u001B[32m[INFO] Check out  - $k8sGitBranch $k8sGitUrl"
                    checkout([$class: 'GitSCM', branches: [[name: k8sGitBranch]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: targetDir], [$class: 'CheckoutOption', timeout: 30], [$class: 'CloneOption', depth: 0, honorRefspec: true, noTags: true, reference: '', shallow: true, timeout: 30]], submoduleCfg: [], userRemoteConfigs: [[credentialsId:'devops-konadigital', url: k8sGitUrl]]])

                        }

                stage('Build the code and Docker image') {
                        sh """
                sudo systemctl start docker
                sudo chmod 666 /var/run/docker.sock
                ls -l ${WORKSPACE}
                docker build -t ${DockerTag} .
                        """
                }

                stage('Connect and Push to ECR repo') {
                withCredentials([[ $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId : 'learnua-creds',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                                                ]])
                        {
                            sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY}
                        docker push ${DockerTag}
                            """
                        }

                }
                 stage('Connect to EKS and deploy') {
                withCredentials([[ $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId : 'learnua-creds',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                                                ]])
                        {

                        sh """
                        echo "Connecting to EKS cluster"
                        aws eks --region ${AWS_REGION} update-kubeconfig --name ${EksCluster}
                        """

                        def status = sh(returnStatus: true, script: "kubectl get deployments ${jobName}-dev -n ${NameSpace} > output.txt")

                        if (status != 0) {

                         sh """
                        cd ${WORKSPACE}/temp/
                        source ${jobName}/*-${GIT_BRANCH}.sh
                        source scripts/replace.sh
                        applyKubectl ${NameSpace} ${jobName}/${jobName}-deployment.yaml ${imageTag}
                        applyKubectl ${NameSpace} ${jobName}/${jobName}-service.yaml ${imageTag}
                        """

                    } else {

                        sh """
                        cd ${WORKSPACE}/temp/
                        source ${jobName}/*-${GIT_BRANCH}.sh
                        source scripts/replace.sh
                        applyKubectl ${NameSpace} ${jobName}/${jobName}-deployment.yaml ${imageTag}
                                """
                        }
                }
                }
        }
                }

        catch(err) {
                wrap([$class: 'AnsiColorBuildWrapper']) {
                        println "\u001B[41m[ERROR]: Build Failed"
                }
                currentBuild.result = "FAILED"
                throw err
        }
}
