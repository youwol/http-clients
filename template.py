from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import Template, PackageType, Dependencies, \
    RunTimeDeps, generate_template

template = Template(
    path=Path(__file__).parent,
    type=PackageType.Library,
    name="@youwol/http-clients",
    version="0.1.13-wip",
    shortDescription="The library exposes some of YouWol backend services.",
    author="greinisch@youwol.com",
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            load={
                "rxjs": "^6.5.5"
            },
        ),
        devTime={
            "@youwol/cdn-client": "^0.1.3",
            "isomorphic-fetch": "^3.0.0",
        }),
    testConfig="https://github.com/youwol/integration-tests-conf",
    userGuide=True
    )

generate_template(template)
