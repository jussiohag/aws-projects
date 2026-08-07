from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    Tags,
    Duration,
    aws_lambda as lambda_,
    aws_apigateway as apigw,
    aws_s3 as s3,
    aws_iam as iam,
    aws_logs as logs,
)
from constructs import Construct


class RagStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        Tags.of(self).add("Project", "rag-bedrock")
        Tags.of(self).add("Owner", "jussi")
        Tags.of(self).add("Environment", "demo")

        data_bucket = s3.Bucket.from_bucket_name(
            self, "DataBucket", f"helsinki-data-lake-{self.account}"
        )

        log_group = logs.LogGroup(
            self,
            "RagFunctionLogs",
            retention=logs.RetentionDays.ONE_WEEK,
            removal_policy=RemovalPolicy.DESTROY,
        )

        fn = lambda_.Function(
            self,
            "RagFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="index.handler",
            code=lambda_.Code.from_asset("../lambda"),
            timeout=Duration.seconds(60),
            memory_size=512,
            environment={
                "DATA_BUCKET": data_bucket.bucket_name,
                "DATA_KEY": "raw/helsinki_service_points.csv",
                "MODEL_ID": "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
            },
            log_group=log_group,
        )

        data_bucket.grant_read(fn)

        fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel"],
                resources=[
                    f"arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
                    f"arn:aws:bedrock:{self.region}:{self.account}:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0",
                ],
            )
        )

        api = apigw.RestApi(
            self,
            "RagApi",
            rest_api_name="Helsinki RAG API",
            description="RAG-powered Q&A over Helsinki service map data",
            deploy_options=apigw.StageOptions(
                stage_name="prod",
                throttling_rate_limit=10,
                throttling_burst_limit=5,
            ),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=["GET", "POST", "OPTIONS"],
                allow_headers=["Content-Type", "x-api-key"],
            ),
        )

        api_key = api.add_api_key("RagApiKey", api_key_name="rag-demo-key")
        plan = api.add_usage_plan(
            "RagUsagePlan",
            name="rag-demo-plan",
            throttle=apigw.ThrottleSettings(rate_limit=10, burst_limit=5),
            quota=apigw.QuotaSettings(limit=100, period=apigw.Period.DAY),
        )
        plan.add_api_key(api_key)
        plan.add_api_stage(stage=api.deployment_stage)

        ask_resource = api.root.add_resource("ask")
        ask_resource.add_method(
            "POST",
            apigw.LambdaIntegration(fn),
            api_key_required=True,
        )

        health_resource = api.root.add_resource("health")
        health_resource.add_method("GET", apigw.LambdaIntegration(fn))

        CfnOutput(self, "ApiUrl", value=api.url)
        CfnOutput(self, "AskEndpoint", value=f"{api.url}ask")
        CfnOutput(self, "HealthEndpoint", value=f"{api.url}health")
