import { request } from "../../utility/request";
import { IDefaultParams, IError } from "../../types";
import { ChatActionsNewResponse } from "../../types/v2/chat_actions_new";
import { ChatActionsKeepaliveResponse } from "../../types/v2/chat_actions_keepalive";
import { handleErrors } from "../../utility/handleErrors";


type params = ({
  type: 'new';

  is_action: boolean;

  user_id: number;
  message: string;

  uuid?: string;
} | {
  type: 'keepalive';

  history_since?: number;
  since?: number;
});


type Response<T extends params['type']> =
  T extends 'new'
  ? ChatActionsNewResponse & IError
  : T extends 'keepalive'
  ? ChatActionsKeepaliveResponse[] & IError
  : IError;


export const chat_actions = async <T extends params>(params: T, addons?: IDefaultParams): Promise<Response<T['type']>> => {
  const object: any = {};
  let url = 'https://osu.ppy.sh/api/v2';
  let method = 'POST';


  switch (params?.type) {
    case 'new':
      url += `/chat/new`;
      method = 'POST';

      if (params.is_action == null || params.user_id == null || params.message == null) {
        return handleErrors(new Error('Missing required parameters')) as Response<T['type']>;
      };


      if (params?.is_action != null) object['is_action'] = params.is_action;
      if (params?.user_id != null) object['target_id'] = params.user_id;
      if (params?.message != null) object['message'] = params.message;
      if (params?.uuid) object['uuid'] = params.uuid;
      break;

    case 'keepalive':
      url += `/chat/ack`;
      method = 'POST';

      if (params?.history_since != null) object['history_since'] = params.history_since;
      if (params?.since != null) object['since'] = params.since;
      break;

    default:
      return handleErrors(new Error(`Unsupported type: ${(params as any).type}`)) as Response<T['type']>;
  };


  const data = await request(url, {
    method: method,
    params: object,
    addons,
  });

  if (data.error) return handleErrors(new Error(data.error)) as Response<T['type']>;


  if (params?.type == 'keepalive') return data.silences as Response<T['type']>;
  return data as Response<T['type']>;
};