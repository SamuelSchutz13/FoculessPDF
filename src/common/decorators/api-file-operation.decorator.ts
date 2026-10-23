import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

interface ApiFileOperationOptions {
  summary: string;
  body: Type;
  produces: string;
}

export function ApiFileOperation({ summary, body, produces }: ApiFileOperationOptions) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: body }),
    ApiProduces(produces),
    ApiOkResponse({ schema: { type: 'string', format: 'binary' } }),
    ApiBadRequestResponse({ description: 'Invalid parameters' }),
    ApiUnprocessableEntityResponse({ description: 'Missing file, invalid type or size' }),
  );
}
