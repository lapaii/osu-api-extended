import { IDefaultParams, IError } from "../../types";
import { MatchesDetailsResponse } from "../../types/v2/matches_detaIls";
import { handleErrors } from "../../utility/handleErrors";
import { request } from "../../utility/request";


type Response = MatchesDetailsResponse & IError;


export const matches_details = async (params: { match_id: number }, addons?: IDefaultParams): Promise<Response> => {
  if (params?.match_id == null) {
    return handleErrors(new Error('Specify match id')) as Response;
  };


  const data = await request(`https://osu.ppy.sh/api/v2/matches/${params.match_id}`, {
    method: 'GET',
    addons,
  });

  if (data.error) return handleErrors(new Error(data.error));


  return data;
};