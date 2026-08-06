#!/usr/bin/env python3
import aws_cdk as cdk
from cdk.static_hosting_stack import StaticHostingStack

app = cdk.App()
StaticHostingStack(
    app,
    "StaticHostingStack",
    env=cdk.Environment(region="eu-north-1"),
)
app.synth()
