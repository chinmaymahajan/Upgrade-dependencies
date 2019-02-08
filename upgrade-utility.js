/*eslint-disable*/

/* command line variables */
const argv = require('minimist')(process.argv.slice(2));
let packages = argv.package;
let exclude = argv.exclude;
let type = argv.type;
let npm = argv.npm;
let category = argv.category;
// let repositoryPath = argv.repositoryPath

/* package tp execute shell scripts and manipulate file */
const shell = require('shelljs');
const fs = require('fs');
const upgradeUtilityPath = __dirname;

/* Commands */
const upgradePackagesCommand = 'yarn upgrade';
const upgradeAllPackagesCommand = 'yarn upgrade --latest';
const outdatedPackageCommand = `yarn outdated --json | ${upgradeUtilityPath}/node_modules/.bin/format-yarn-outdated --format json`;
const outdatedPackageCommandNpm = 'npm outdated --json --l';
const upgradePackagesCommandNpm = 'npm install';
const upgradeAllPackagesCommandNpm = 'npm install -u';

let fileData = {
	packages: [],
	version: []
};
let dependencies2 = [];

/* filter packages list to upgrade */
const sortPackages = (exclude, type, packages) => {
	let updateCategory;
	let eachCategory;
	let dependencies = [];

	const outdatedPackagesJson = shell.exec(outdatedPackageCommand, { silent: true });

	if (outdatedPackagesJson.code !== 0) return;

	let outdatedPackages = JSON.parse(outdatedPackagesJson);
	let packageType;
	let packageName;
	let packageWantedVersion;
	let packageLatestVersion;
	let upgradeTo;
	let versionSpecified;
	let packageVersionProvided;

	const getPackageNameWithVersion = (packageName, version) => {
		return packageName + '@' + version;
	}

	console.log('Sorting packages...');

	for (updateCategory in outdatedPackages) {
		if (outdatedPackages.hasOwnProperty(updateCategory)) {
			eachCategory = outdatedPackages[updateCategory];

			eachCategory.forEach(dep => {
				packageType = dep[4];
				packageName = dep[0];
				packageWantedVersion = dep[1];
				packageLatestVersion = dep[3];

				if (category && updateCategory === category && (exclude && !exclude.includes(packageName))) {
						dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
						writeFile(packageName, packageLatestVersion);
				}

				if (category && updateCategory === category) {
						dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
						writeFile(packageName, packageLatestVersion);
				}

				// if type is given and want to exclude
				if ((type && type === packageType) && (exclude && !exclude.includes(packageName))) {
					dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
					writeFile(packageName, packageLatestVersion);
				}

				// if packages list is given
				if (packages && packageNameProvided(packageName, packages)) {
					packageVersionProvided = packageNameProvided(packageName, packages);

						versionSpecified = packageVersionProvided[1]
						? packageVersionProvided[1]
						: undefined;

					if (versionSpecified) {
						if (versionSpecified > packageLatestVersion) {
							console.log(`WARNING Version specified for ${packageName} is incorrect, upgrading to ${packageLatestVersion}`);
							upgradeTo = '@' + packageLatestVersion;
						} else {
							upgradeTo = versionSpecified
								? '@' + versionSpecified
								: '@' + packageLatestVersion;
						}
					} else {
						upgradeTo = '@' + packageLatestVersion;
					}

					dependencies.push(packageName + upgradeTo);
					writeFile(packageName, upgradeTo);
				}

				// if exclude list is given
				if (!type && !category && exclude && !exclude.includes(packageName)) {
					dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
					writeFile(packageName, packageLatestVersion);
				}

				// if type is given
				if (type && !category && type === packageType && !exclude) {
					dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
					writeFile(packageName, packageLatestVersion);
				}

				// upgrade all
				if (!type && !exclude && !packages && !category) {
					dependencies.push(getPackageNameWithVersion(packageName, packageLatestVersion));
					writeFile(packageName, packageLatestVersion);
				}
			});
		}
	}
	return dependencies.join(' ');
};

const sortNpmPackages = (exclude, type, packages) => {

	const outdatedPackagesJson = shell.exec(outdatedPackageCommandNpm, { silent: true });

	if (!outdatedPackagesJson.stdout) {
		return;
	}
	let outdatedPackages = JSON.parse(outdatedPackagesJson);
	let dependencies = [];
	let packageName;
	let packageWithLatestVersion;
	let versionSpecified;
	let upgradeTo;
	let val;
	let packageLatestVersion;
	let packageType;
	let npmPackageVersionProvided;
	let i = 0;

	console.log('Sorting packages...');

	for (packageName in outdatedPackages) {

		if (outdatedPackages.hasOwnProperty(packageName)) {
			val = outdatedPackages[packageName];
			packageLatestVersion = val.latest;
			packageType = val.type;

			if ((type && type === packageType) && (exclude && !exclude.includes(packageName))) {
				packageWithLatestVersion = packageName + versionSpecified;
				dependencies.push(packageWithLatestVersion);
				writeFile(packageName, packageLatestVersion);
			}

			if (packages && packageNameProvided(packageName, packages)) {
				npmPackageVersionProvided = packageNameProvided(packageName, packages);

				versionSpecified = npmPackageVersionProvided[1]
					? npmPackageVersionProvided[1]
					: undefined;

				if (versionSpecified) {

					if (versionSpecified > packageLatestVersion) {
						console.log(`WARNING Version specified for ${packageName} is incorrect, upgrading to ${packageLatestVersion}`);
						upgradeTo = '@latest';
					} else {
						upgradeTo = versionSpecified
							? '@' + versionSpecified
							: '@latest';
					}
				} else {
					upgradeTo = '@latest';
				}
				i++;

				packageWithLatestVersion = packageName + upgradeTo;
				dependencies.push(packageWithLatestVersion);
				writeFile(packageName, upgradeTo);
			}

			if (!type && exclude && !exclude.includes(packageName)) {
				packageWithLatestVersion = packageName + '@latest';
				dependencies.push(packageWithLatestVersion);
				writeFile(packageName, packageLatestVersion);
			}

			if (type && type === packageType && !exclude) {

				packageWithLatestVersion = packageName + '@latest';
				dependencies.push(packageWithLatestVersion);
				writeFile(packageName, packageLatestVersion);
			}

			if (!type && !exclude && !packages) {
				packageWithLatestVersion = packageName + '@latest';
				dependencies.push(packageWithLatestVersion);
				writeFile(packageName, packageLatestVersion);
			}
		}
	}
	return dependencies.join(' ');
};

const packageNameProvided = (eachPackage, packageList) => {

	let version
	for (let i = 0; i < packageList.length; i++) {
		if (packageList[i].includes(eachPackage)) {
			if (packageList[i].includes('@')) {
				version = packageList[i].split('@').pop();
				return [true, version];
			}
			return true;
		}
	}
	return false;
};

const writeFile = (packages, version) => {
	fileData.packages.push(packages);
	fileData.version.push(version);
};

/* Update Report in file */
const generateReport = () => {

	for (let i = 0; i < fileData.packages.length; i++)
		console.log(fileData.packages[i], ' => ' , fileData.version[i]);

	fileData = JSON.stringify(fileData);
	fs.writeFile('upgradeReport.txt', fileData, err => {
		if (err) throw err;
	});
};

/* upgrade the packages */
const upgradeDependencies = (packageToUpgrade, npmPackageManager) => {
	let upgradePackagesCommandWithPackages;

	if (npmPackageManager) {

		if (packageToUpgrade) {
			upgradePackagesCommandWithPackages = upgradePackagesCommandNpm + ' ' + packageToUpgrade + ' --save';
		} else {
			upgradePackagesCommandWithPackages = upgradeAllPackagesCommandNpm;
		}
	} else {
		if (packageToUpgrade) {
			upgradePackagesCommandWithPackages = upgradePackagesCommand + ' ' + packageToUpgrade;
		} else {
			upgradePackagesCommandWithPackages = upgradeAllPackagesCommand;
		}
	}
	if (upgradePackagesCommandWithPackages) {
		console.log('Upgrading packages...');

		const executeCommand = shell.exec(upgradePackagesCommandWithPackages, { silent: false });

		if (executeCommand.code !== 0) {
			console.log('Failed to upgrade dependencies', executeCommand.stderr);
			process.abort()
		}
		else generateReport(packageToUpgrade);
	}
};

/* splitting the comma seperated list */
const parseCommandLineArguments = commaSeperatedPackagesList => {
	let packageList = commaSeperatedPackagesList.split(',');

	for (let i = 0; i < packageList.length; i++) {
		packageList[i] = packageList[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		packageList[i] = packageList[i].trim();
	}
	return packageList;
};

const upgradeDependenciesWrapper = () => {
	let packagesToUpgradeNpm;
	let packagesToUpgrade;

	if (npm) {
		if (type && exclude) {
			packagesToUpgradeNpm = sortNpmPackages(parseCommandLineArguments(exclude), type);
		} else if (packages) {
			packagesToUpgradeNpm = sortNpmPackages('', '', parseCommandLineArguments(packages));
		} else if (exclude) {
			packagesToUpgradeNpm = sortNpmPackages(parseCommandLineArguments(exclude));
		} else if (type) {
			packagesToUpgradeNpm = sortNpmPackages('', type);
		} else {
			packagesToUpgradeNpm = sortNpmPackages();
		}
		if (!packagesToUpgradeNpm) {
			console.log('No outdated packages');
		} else {
			upgradeDependencies(packagesToUpgradeNpm, npm);
		}

	} else {
		if (type && exclude) {
			packagesToUpgrade = sortPackages(parseCommandLineArguments(exclude), type);
		} else if (packages) {
			packagesToUpgrade = sortPackages('', '', parseCommandLineArguments(packages));
		} else if (exclude) {
			packagesToUpgrade = sortPackages(parseCommandLineArguments(exclude));
		} else if (type) {
			packagesToUpgrade = sortPackages('', type);
		} else {
			packagesToUpgrade = sortPackages();
		}

		if (!packagesToUpgrade) {
			console.log('No outdated packages');
		} else {
			upgradeDependencies(packagesToUpgrade);
		}
	}
};

upgradeDependenciesWrapper();
