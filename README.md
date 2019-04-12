# Upgrade-dependencies
> A command line utility for easily upgrading the outdated npm dependencies in your [Node.js](https://nodejs.org/en/) project.

**Get it from npm registry [upgrade-dependencies](https://www.npmjs.com/package/upgrade-dependencies)**

#### Supported yarn and npm node package manager 

## Features
- The utility supports by default Yarn  and for NPM --npm='true' flag has to be specified.

The utility supports number of different ways to upgrade packages, you can specify the flag to determine what packages needs to be upgraded <br/>
Following are the number of ways packages can be upgraded
  - Upgrade all packages
     - `node node_modules/upgrade-dependencies/index.js`
  - List of packages
    - `node node_modules/upgrade-dependencies/index.js --package="package1_name, package2_name"`
  - List of packages with version
    - `node node_modules/upgrade-dependencies/index.js --package="package1_name@2.0.0, package2_name@3.0.0"`
  - Type of dependency
    - `node node_modules/upgrade-dependencies/index.js --type="devDependencies"`
  - Exclude list of packages
    - `node node_modules/upgrade-dependencies/index.js --exclude="package1_name, package2_name"`
  - Specific flag (major, minor and patch)
    - `node node_modules/upgrade-dependencies/index.js --category="major"`
  - Type of dependency and exclude list
    - `node node_modules/upgrade-dependencies/index.js --type="dependencies" --exclude="package1_name"`
   - Supports npm with any other flag
    - `node node_modules/upgrade-dependencies/index.js --package="package1_name" --npm=true`
    
The report will be generated after upgrading the packages specifying what packages were upgraded to what version in upgradeReport.txt file.
