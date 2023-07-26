#!/usr/bin/env node

// console.log("Hello World!");
const { program } = require('commander');
const inquirer = require('inquirer');
const package = require('../package.json');
const path = require('path');
const downloadGitRepo = require('download-git-repo');
const ora = require('ora');
const fs = require('fs-extra');
// const { getGitReposList } = require('./api.js');
const templates = require('./templates.js'); // 静态模板列表

// 版本号
program.version(`v${package.version}`)
program.on('--help', () => { })

// 用户执行命令传入参数
program
  .command('create [projectName]')
  .option('-t, --template <template>', '模板名称')
  .description('创建模板')
  .action(async (projectName, options) => {

    // 远程获取模板列表
    // const getGitReposLoading = ora('正在获取模板列表...');
    // getGitReposLoading.start();
    // const templates = await getGitReposList('ZhongboHuang');
    // getGitReposLoading.succeed('获取模板列表成功');
    
    // 1.从模板列表中找到对应的模板
    let project = templates.find(item => item.name === options.template);
    // 2.如果匹配到模版就赋值，没有匹配到就是undefined
    let projectTemplate = project ? project.value : undefined;
    console.log('命令行参数:', projectName, projectTemplate);
    // 3.如果用户没有传入名称就交互式输入
    if (!projectName) { 
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: '请输入项目名称:',
        default: 'my-first-project'
      })
      projectName = name;
    }
    // 4.如果用户没有传入模板就交互式输入
    if (!projectTemplate) {
      const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模板:',
        choices: templates
      })
      projectTemplate = template;
    }

    // 5.判断当前目录是否存在同名文件夹
    const targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) { 
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '当前目录已存在，是否覆盖?'
      })
      force ? fs.removeSync(targetDir) : process.exit(1);
    }
    const loading = ora('正在下载模板...');
    loading.start();
    // 目标文件夹
    downloadGitRepo(projectTemplate, targetDir, (err) => { 
      if (err) { 
        loading.fail('创建失败', err);
      } else {
        loading.succeed('创建成功');
        // 添加引导信息
        console.log(`/ncd ${projectName}`);
        console.log(`npm install`);
        console.log(`npm run dev`);
      }
    })
  })

// 解析用户执行命令传入参数
program.parse(process.argv);