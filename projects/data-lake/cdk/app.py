#!/usr/bin/env python3
import os
import aws_cdk as cdk
from cdk.data_lake_stack import DataLakeStack

app = cdk.App()
DataLakeStack(
    app,
    "DataLakeStack",
    env=cdk.Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT"),
        region=os.getenv("CDK_DEFAULT_REGION"),
    ),
)

app.synth()
