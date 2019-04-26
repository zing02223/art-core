import { CommandModule, Argv } from 'yargs';
import { cyanBoldText, greenText, grayText } from 'art-dev-utils/lib/chalkColors';
import { webpackTask } from '../helpers/webpackTask';
import { getProjectType } from '../helpers/projectType';
import { ProjectTypes } from '../enums/ProjectTypes';

class ServeCommand implements CommandModule {
  public readonly command = 'serve';

  public readonly desc = grayText('Serve one or more modules');

  public builder(args: Argv): Argv {
    const moduleRequired = getProjectType() !== ProjectTypes.miniprogram;
    return args.usage(`${cyanBoldText('Usage:')} $0 serve --modules="modulePath1, modulePath2, ..."`)
      .options('modules', {
        alias: 'm',
        describe: 'the modules you would like to serve',
        demandOption: moduleRequired
      })
      .example(`${greenText('$0 serve -modules="client/test"')}`, 'Serve the client/test module');
  }

  public handler(args: any): void {
    webpackTask('serve', { modules: args.modules });
  }
}

module.exports = new ServeCommand();