import { LogicException } from '@aimelo/common';
import { ArgumentsHost, Logger, WsExceptionFilter } from '@nestjs/common';
import { READY_STATE } from './enums';
import { transOutput } from './trans-output.util';

export class GatewayExceptionFilter implements WsExceptionFilter {
    protected readonly logger = new Logger('WsExceptionsHandler');
    catch(exception: any, host: ArgumentsHost) {
        const input = host.switchToWs().getData();
        const client = host.switchToWs().getClient();
        if (!(exception instanceof LogicException)) {
            this.logger.error(exception);
        }
        if (client.readyState !== READY_STATE.OPEN_STATE) {
            this.logger.debug(`Client is status is Error: ${READY_STATE[client.readyState]}`);
            return;
        }
        client.send(transOutput(input, exception));
    }
}
