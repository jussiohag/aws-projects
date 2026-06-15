from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    Tags,
    aws_s3 as s3,
    aws_glue as glue,
    aws_athena as athena,
    aws_iam as iam,
)
from constructs import Construct


class DataLakeStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        Tags.of(self).add("Project", "data-lake")
        Tags.of(self).add("Owner", "jussi")
        Tags.of(self).add("Environment", "demo")

        # S3 bucket for raw + curated data
        data_bucket = s3.Bucket(
            self,
            "DataBucket",
            bucket_name=f"helsinki-data-lake-{self.account}",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        # S3 bucket for Athena query results
        results_bucket = s3.Bucket(
            self,
            "ResultsBucket",
            bucket_name=f"helsinki-data-lake-results-{self.account}",
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        # Glue database
        database = glue.CfnDatabase(
            self,
            "Database",
            catalog_id=self.account,
            database_input=glue.CfnDatabase.DatabaseInputProperty(
                name="helsinki_open_data",
                description="Helsinki region open data lake",
            ),
        )

        # IAM role for Glue crawler
        crawler_role = iam.Role(
            self,
            "CrawlerRole",
            assumed_by=iam.ServicePrincipal("glue.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AWSGlueServiceRole"
                ),
            ],
        )
        data_bucket.grant_read(crawler_role)

        # Glue crawler for raw CSV data
        crawler = glue.CfnCrawler(
            self,
            "RawCrawler",
            name="helsinki-raw-crawler",
            role=crawler_role.role_arn,
            database_name="helsinki_open_data",
            targets=glue.CfnCrawler.TargetsProperty(
                s3_targets=[
                    glue.CfnCrawler.S3TargetProperty(
                        path=f"s3://{data_bucket.bucket_name}/raw/"
                    )
                ]
            ),
            schema_change_policy=glue.CfnCrawler.SchemaChangePolicyProperty(
                update_behavior="UPDATE_IN_DATABASE",
                delete_behavior="DELETE_FROM_DATABASE",
            ),
        )
        crawler.add_dependency(database)

        # Athena workgroup with byte-scan limit
        workgroup = athena.CfnWorkGroup(
            self,
            "Workgroup",
            name="helsinki-data-lake",
            description="Helsinki open data lake queries",
            work_group_configuration=athena.CfnWorkGroup.WorkGroupConfigurationProperty(
                result_configuration=athena.CfnWorkGroup.ResultConfigurationProperty(
                    output_location=f"s3://{results_bucket.bucket_name}/query-results/",
                ),
                bytes_scanned_cutoff_per_query=1073741824,  # 1 GB limit
                enforce_work_group_configuration=True,
                publish_cloud_watch_metrics_enabled=True,
            ),
        )

        CfnOutput(self, "DataBucketName", value=data_bucket.bucket_name)
        CfnOutput(self, "ResultsBucketName", value=results_bucket.bucket_name)
        CfnOutput(self, "GlueDatabaseName", value="helsinki_open_data")
        CfnOutput(self, "CrawlerName", value="helsinki-raw-crawler")
        CfnOutput(self, "AthenaWorkgroup", value="helsinki-data-lake")
