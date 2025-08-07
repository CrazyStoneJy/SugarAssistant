import * as FileSystem from 'expo-file-system';

interface TencentOcrResponse {
  code: number;
  message: string;
  requestId: string;
  auditData?: Array<{
    ImageUrl: string;
    Label: string;
    Score: string;
    Suggestion: string;
  }>;
  data?: {
    Response?: {
      Angle: number;
      RequestId: string;
      StructuralList: any[];
      TokenNum: number;
      WordList: any[];
    };
    Result?: {
      Text?: string;
      Items?: Array<{
        Text?: string;
      }>;
    };
    text?: string;
    confidence?: number;
  };
}

/**
 * 将图片文件转换为Base64编码
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    console.log('📁 开始转换图片为Base64...');
    
    // 读取图片文件为Base64编码
    const imageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ 图片转Base64成功');
    return imageData;
  } catch (error) {
    console.error('❌ 图片转Base64失败:', error);
    throw new Error('图片处理失败');
  }
}

/**
 * 使用腾讯OCR API识别图片中的文字
 */
export async function recognizeTextWithTencentOcr(imageUri: string): Promise<string> {
  try {
    console.log('🔍 开始腾讯OCR文字识别...');

    // 将图片转换为Base64
    const imageBase64 = await imageToBase64(imageUri);

    // 调用腾讯OCR demo API
    const apiUrl = 'https://aistudio.cloud.tencent.com/demo-user/capi/getResult/';
    
    const requestBody = {
      module: "ocr",
      action: "ExtractDocMulti",
      from: "pc",
      userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
      payload: {
        ConfigId: "General",
        ItemNamesShowMode: true,
        EnableCoord: false,
        ReturnFullText: false,
        ItemNames: [],
        ImageBase64: imageBase64
      }
    };

    console.log('🌐 发送腾讯OCR API请求...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': '__root_domain_v=.tencent.com; _qddaz=QD.689444619199555; qcommunity_identify_id=mOohlGiW3EHymI5CDthM3; qcloud_from=qcloud.google.seo-1752455251575; qcstats_seo_keywords=%E9%80%9A%E7%94%A8%E6%8A%80%E6%9C%AF-%E7%A7%BB%E5%8A%A8%E5%BC%80%E5%8F%91-android%2C%E5%85%B6%E4%BB%96-%E7%A9%BA%E7%B1%BB-%E9%9D%A2%E8%AF%95%2C%E5%85%B6%E4%BB%96-; qcloud_uid=E8e_GsrZZZ2f; ewpUid=d1c46f31-d69a-4f52-a8e0-0aefb931becc; _gcl_au=1.1.2062934077.1752455253; language=zh; qcmainCSRFToken=RghH4WTbkn1w; qcloud_visitId=3ed1a845c52fb03e78373640bae6ffce; loginType=wx; qcloud_outsite_refer=https://open.weixin.qq.com; intl=1; uin=o100014519541; tinyid=144115218050952294; skey=XOii6t7F*YBC6rFv83lupVN02HkkHD2p49a*NKcVK*E_; lastLoginIdentity=7badfb4991e2816031f8dd741748b39f; refreshSession=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22100014519541%22%2C%22first_id%22%3A%221980679067d2cc-0c00fbb73d085b8-17525636-2073600-1980679067e2391%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%A4%BE%E4%BA%A4%E7%BD%91%E7%AB%99%E6%B5%81%E9%87%8F%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTk4MDY3OTA2N2QyY2MtMGMwMGZiYjczZDA4NWI4LTE3NTI1NjM2LTIwNzM2MDAtMTk4MDY3OTA2N2UyMzkxIiwiJGlkZW50aXR5X2xvZ2luX2lkIjoiMTAwMDE0NTE5NTQxIn0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22100014519541%22%7D%7D; qcstats_ouin-100014519541=100014519541; qcstats_utype-100014519541=0; saas_synced_session=100014519541%7CXOii6t7F*YBC6rFv83lupVN02HkkHD2p49a*NKcVK*E_; tgw_l7_route=504e8e885a872e3fffd02462d84887bc; from=27778; trafficParams=***%24%3Btimestamp%3D1754534516976%3Bfrom_type%3Dserver%3Btrack%3D063a414f-b6af-4ccc-ba60-6385c83df721%3B%24***; opc_xsrf=319527f9040eca93313458142717e905%7C1754534517; nick=crazystone13753251592%40gmail.com',
        'Referer': 'https://ocrdemo.cloud.tencent.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const data: TencentOcrResponse = await response.json();

    console.log('📋 腾讯OCR API响应:', JSON.stringify(data));

    if (data.code !== 0) {
      throw new Error(`腾讯OCR识别失败: ${data.message} (错误码: ${data.code})`);
    }

    // 添加详细的调试信息
    console.log('🔍 响应数据结构分析:');
    console.log('- data.Response:', data.data?.Response);
    console.log('- data.Result:', data.data?.Result);
    console.log('- data.text:', data.data?.text);
    console.log('- WordList长度:', data.data?.Response?.WordList?.length);
    console.log('- StructuralList长度:', data.data?.Response?.StructuralList?.length);

    // 处理不同的响应格式
    let recognizedText = '';
    
    if (data.data?.Response?.StructuralList && data.data.Response.StructuralList.length > 0) {
      // 新格式：从StructuralList中提取文字
      console.log('📝 从StructuralList提取文字...');
      recognizedText = data.data.Response.StructuralList
        .map((structuralItem: any) => {
          // 从Groups中提取文字
          if (structuralItem.Groups && structuralItem.Groups.length > 0) {
            return structuralItem.Groups
              .map((group: any) => {
                // 从Lines中提取文字
                if (group.Lines && group.Lines.length > 0) {
                  return group.Lines
                    .map((line: any) => {
                      let text = '';
                      // 提取Key的AutoName
                      if (line.Key?.AutoName) {
                        text += line.Key.AutoName + ': ';
                      }
                      // 提取Value的AutoContent
                      if (line.Value?.AutoContent) {
                        text += line.Value.AutoContent;
                      }
                      return text;
                    })
                    .filter(Boolean)
                    .join(' ');
                }
                return '';
              })
              .filter(Boolean)
              .join('\n');
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');
      console.log('✅ StructuralList提取结果:', recognizedText);
    } else if (data.data?.Response?.WordList && data.data.Response.WordList.length > 0) {
      // 格式：从WordList中提取文字
      console.log('📝 从WordList提取文字...');
      recognizedText = data.data.Response.WordList
        .map((word: any) => word.Word || word.text || '')
        .filter(Boolean)
        .join(' ');
      console.log('✅ WordList提取结果:', recognizedText);
    } else if (data.data?.Result?.Text) {
      // 格式：Result.Text
      console.log('📝 从Result.Text提取文字...');
      recognizedText = data.data.Result.Text;
      console.log('✅ Result.Text提取结果:', recognizedText);
    } else if (data.data?.Result?.Items && data.data.Result.Items.length > 0) {
      // 格式：Result.Items
      console.log('📝 从Result.Items提取文字...');
      recognizedText = data.data.Result.Items.map(item => item.Text).filter(Boolean).join('\n');
      console.log('✅ Result.Items提取结果:', recognizedText);
    } else if (data.data?.text) {
      // 旧格式：data.text
      console.log('📝 从data.text提取文字...');
      recognizedText = data.data.text;
      console.log('✅ data.text提取结果:', recognizedText);
    } else {
      // 如果没有识别到文字，返回提示信息
      console.log('⚠️ 未识别到文字内容，响应结构:', JSON.stringify(data, null, 2));
      throw new Error('未识别到文字内容，请确保图片清晰且包含文字');
    }

    console.log('✅ 腾讯OCR识别成功:', recognizedText);
    
    return recognizedText;
  } catch (error) {
    console.error('❌ 腾讯OCR识别失败:', error);
    throw new Error(`文字识别失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 检查腾讯OCR API是否可用
 */
export async function checkTencentOcrAvailability(): Promise<boolean> {
  try {
    // 简单的网络连接测试
    const response = await fetch('https://aistudio.cloud.tencent.com/demo-user/capi/getResult/', {
      method: 'HEAD',
    });
    return response.status !== 0;
  } catch (error) {
    console.error('❌ 腾讯OCR API不可用:', error);
    return false;
  }
} 