import { IDefaultParams, IError } from "../../types";
import { download } from "../../utility/request";
import { cache, credentials } from "../../utility/auth";
import path from "path";
import fs from "fs";
import { handleErrors } from "../../utility/handleErrors";



type params = ({
  type: 'difficulty';

  id: number;
  host: 'osu' | 'osu_direct_mirror' | 'catboy';

  file_path: string;
  overwrite?: boolean;

  progress_track_fn?: (host: string, progress: number) => void;
} | {
  type: 'set';

  id: number;
  host: 'osu' | 'beatconnect' | 'nerinyan' | 'osu_direct_mirror' | 'sayobot' | 'gatari' | 'ripple' | 'catboy' | 'mino' | 'akatsuki',

  file_path: string;
  no_video?: boolean;
  overwrite?: boolean;

  progress_track_fn?: (host: string, progress: number) => void;
});


type Response = {
  status: string,
  destination?: string,
  /**
   * Time in milliseconds
   */
  elapsed_time?: number
} & IError;


/**
 * `async` Downloads a beatmap or beatmap set by given ID. (Supports different hosts)
 *
 * &nbsp;
 *
 * ### Available hosts
 * - `type:'difficulty'`: osu, osu_direct_mirror, catboy
 * - `type:'set'`: osu, beatconnect, nerinyan, osu_direct_mirror, sayobot, gatari, ripple, catboy
 *
 * &nbsp;
 *
 * ### Global Parameters
 * - `params.type` - Type of the beatmap.
 * - `params.id` - ID of the beatmap or beatmap set.
 * - `params.host` - Host of the download source.
 * - `params.file_path` - Path to the save location.
 * - `params.overwrite` - Whether to overwrite the file if it already exists.
 *
 * &nbsp;
 *
 * ### Parameters for `params.type:'set'`
 * - `params.no_video?` - Whether to include video in the download.
 *
 * &nbsp;
 *
 * ### Usage Example
 * ```js
 * const { auth, v2, tools } = require('osu-api-extended');
 * 
 * async function main() {
 *   try {
 *     // only for downloading sets from osu host
 *     await auth.login({
 *       type: 'lazer',
 *       login: login,
 *       password: password,
 *       cachedTokenPath: './test.json' // please use for caching
 *     });
 * 
 * 
 *     const progress_update = (...args) => {
 *       console.log(args);
 *     };
 *     const set_id = 320118;
 * 
 * 
 *     const result = await v2.beatmaps.download({
 *       type: 'set',
 *       host: 'gatari',
 *       id: set_id,
 *       file_path: `./cache/${set_id}.osz`,
 *       progress_track_fn: progress_update
 *     });
 *     // or
 *     const result = await tools.download_beatmaps({
 *       type: 'set',
 *       host: 'gatari',
 *       id: set_id,
 *       file_path: `./cache/${set_id}.osz`,
 *       progress_track_fn: progress_update
 *     });
 * 
 *     console.log(result);
 *   } catch (error) {
 *     console.log(error);
 *   };
 * };
 * 
 * main();
 * ```
 *
 * &nbsp;
 *
 * [See documentation](https://osu.ppy.sh/docs/index.html#get-apiv2beatmapsetsbeatmapsetdownload)
 */
export const beatmaps_download = async <T extends params>(params: T, addons?: IDefaultParams): Promise<Response> => {
  const { dir } = path.parse(params.file_path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });


  if (fs.existsSync(params.file_path) && params.overwrite != true) {
    return { status: 'File already exists' } as Response;
  };


  const progress_track = (progress: number) => {
    params.progress_track_fn(params.host, progress);
  };


  let url = '';
  let headers: any = {
    accept: 'application/octet-stream',
  };


  if (params.type == 'set') {
    switch (params.host) {
      // case 'chimu':
      //   url = `https://api.chimu.moe/v1/download/${params.id}`;
      //   break;

      case 'beatconnect':
        url = `https://beatconnect.io/b/${params.id}/`;
        break;

      case 'sayobot':
        url = `https://dl.sayobot.cn/beatmaps/download/${params.no_video ? 'novideo' : 'full'}/${params.id}`;
        break;

      // DOESNT WORK FOR SOME REASON
      case 'nerinyan':
        url = `https://api.nerinyan.moe/d/${params.id}${params.no_video ? '?nv=1' : ''}`;
        headers['Accept'] = 'application/x-osu-beatmap-archive';
        headers['Referer'] = 'https://nerinyan.moe/';
        headers['User-Agent'] = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`;
        break;

      case 'osu_direct_mirror':
        url = `https://osu.direct/api/d/${params.id}`
        // headers['User-Agent'] = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`;
        break;

      case 'gatari':
        url = `https://osu.gatari.pw/d/${params.id}`;
        headers['Referer'] = 'https://osu.gatari.pw/';
        break;

      case 'ripple':
        url = `https://storage.ripple.moe/d/${params.id}`;
        headers['Referer'] = 'https://ripple.moe/';
        break;

      case 'akatsuki':
        url = `https://akatsuki.gg/d/${params.id}`;
        headers['Referer'] = 'https://akatsuki.gg/';
        break;

      case 'mino':
      case 'catboy':
        url = `https://catboy.best/d/${params.id}`;
        headers['Referer'] = 'https://catboy.best/';
        headers['User-Agent'] = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`;
        break;

      case 'osu':
        if (credentials.type != 'lazer') {
          return handleErrors(`Login via lazer to use this endpoint`) as Response
        };

        if ((addons?.authKey || cache.v2) == null) {
          return handleErrors('osu is not authorized') as Response;
        };


        url = `https://osu.ppy.sh/api/v2/beatmapsets/${params.id}/download${params.no_video ? '?noVideo=1' : ''}`;
        headers['Referer'] = 'https://osu.ppy.sh/';
        break;

      default:
        return handleErrors(`Unsupported host: ${(params as any).host}`) as Response;
    };


    const data = await download(url, params.file_path, {
      _callback: params.progress_track_fn != null,
      headers,
      addons: addons,
      callback: progress_track,
    });

    if (data.error) return handleErrors(data.error);


    return data;
  };


  if (params.type == 'difficulty') {
    switch (params.host) {
      case 'osu_direct_mirror':
        url = `https://api.osu.direct/osu/${params.id}?raw=true`
        break;

      case 'catboy':
        url = `https://catboy.best/osu/${params.id}`;
        headers['Referer'] = 'https://catboy.best/';
        break;

      default:
        url = `https://osu.ppy.sh/osu/${params.id}`;
        break;
    };


    const data = await download(url, params.file_path, {
      _callback: params.progress_track_fn != null,
      headers,
      addons: addons,
      callback: progress_track,
    });

    if (data.error) return handleErrors(data.error);


    return data;
  };


  return handleErrors(`Unsupported type: ${(params as any).type}`) as Response;
};