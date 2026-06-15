#!/usr/bin/env python3
import os
import aws_cdk as cdk
from cdk.ha_web_stack import HaWebStack

app = cdk.App()
HaWebStack(
    app,
    "HaWebStack",
    env=cdk.Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT"),
        region=os.getenv("CDK_DEFAULT_REGION"),
    ),
)
app.synth()
