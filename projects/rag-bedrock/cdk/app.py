#!/usr/bin/env python3
import os
import aws_cdk as cdk
from cdk.rag_stack import RagStack

app = cdk.App()
RagStack(
    app,
    "RagStack",
    env=cdk.Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT"),
        region=os.getenv("CDK_DEFAULT_REGION"),
    ),
)
app.synth()
