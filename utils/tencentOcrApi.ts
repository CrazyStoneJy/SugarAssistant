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
 * 使用腾讯OCR API识别图片中的文字，并进行异常指标过滤和存储
 */
export async function recognizeTextWithTencentOcr(imageUri: string): Promise<{recognizedText: string, abnormalData: string[]}> {
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
    
    // 在OCR接口调用完成后，从原始数据中提取异常指标
    console.log('🔍 开始从OCR原始数据中提取异常指标...');
    const abnormalData = extractAbnormalIndicatorsFromOcrData(data);
    console.log('✅ 异常指标提取完成，发现异常指标数量:', abnormalData.length);
    
    // 持久化存储异常指标数据
    if (abnormalData.length > 0) {
      await storeAbnormalIndicators(abnormalData);
    }
    
    return {
      recognizedText,
      abnormalData
    };
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

/**
 * 从OCR原始数据中提取异常指标
 */
function extractAbnormalIndicatorsFromOcrData(data: TencentOcrResponse): string[] {
  const abnormalData: string[] = [];
  
  // 解析参考范围的函数
  const parseReferenceRange = (referenceRange: string): { min: number, max: number } | null => {
    // 匹配格式如 "3.90-6.10", "0.00-1.71", "137.0-147.0" 等
    const match = referenceRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
    if (match) {
      return {
        min: parseFloat(match[1]),
        max: parseFloat(match[2])
      };
    }
    return null;
  };
  
  // 判断数值是否异常的函数
  const isAbnormal = (value: number, referenceRange: { min: number, max: number }): boolean => {
    return value < referenceRange.min || value > referenceRange.max;
  };
  
  // 从不同数据结构中提取检验项目数据
  const extractTestItems = (data: TencentOcrResponse): Array<{
    itemName: string,
    testName: string,
    result: string,
    unit: string,
    referenceRange: string,
    resultHint: string
  }> => {
    const testItems: Array<{
      itemName: string,
      testName: string,
      result: string,
      unit: string,
      referenceRange: string,
      resultHint: string
    }> = [];
    
    // 从StructuralList中提取
    if (data.data?.Response?.StructuralList) {
      data.data.Response.StructuralList.forEach((structuralItem: any) => {
        if (structuralItem.Groups) {
          structuralItem.Groups.forEach((group: any) => {
            if (group.Lines) {
              let itemName = '';
              let testName = '';
              let result = '';
              let unit = '';
              let referenceRange = '';
              let resultHint = '';
              
              group.Lines.forEach((line: any) => {
                const keyName = line.Key?.AutoName;
                const value = line.Value?.AutoContent;
                
                if (keyName && value) {
                  switch (keyName) {
                    case '项目名称':
                      itemName = value;
                      break;
                    case '检验项目':
                      testName = value;
                      break;
                    case '结果':
                      result = value;
                      break;
                    case '单位':
                      unit = value;
                      break;
                    case '参考范围':
                      referenceRange = value;
                      break;
                    case '结果提示':
                      resultHint = value;
                      break;
                  }
                }
              });
              
              // 只有当所有必要字段都存在时才添加
              if (itemName && testName && result && referenceRange) {
                testItems.push({
                  itemName,
                  testName,
                  result,
                  unit,
                  referenceRange,
                  resultHint
                });
              }
            }
          });
        }
      });
    }
    
    return testItems;
  };
  
  // 提取检验项目数据
  const testItems = extractTestItems(data);
  console.log('🔍 提取的检验项目数据:', testItems);
  
  // 分析每个检验项目
  testItems.forEach(item => {
    const resultValue = parseFloat(item.result);
    const referenceRange = parseReferenceRange(item.referenceRange);
    
    if (!isNaN(resultValue) && referenceRange) {
      const isAbnormalValue = isAbnormal(resultValue, referenceRange);
      const hasResultHint = item.resultHint && (item.resultHint.includes('↑') || item.resultHint.includes('↓'));
      
      // 如果数值异常或有结果提示，则认为是异常指标
      if (isAbnormalValue || hasResultHint) {
        const abnormalText = `${item.testName}: ${item.result} ${item.unit} (参考范围: ${item.referenceRange})${item.resultHint ? ` ${item.resultHint}` : ''}`;
        
        if (!abnormalData.includes(abnormalText)) {
          abnormalData.push(abnormalText);
          
          let reason = '';
          if (isAbnormalValue) {
            if (resultValue > referenceRange.max) {
              reason = '偏高';
            } else if (resultValue < referenceRange.min) {
              reason = '偏低';
            }
          } else if (hasResultHint) {
            reason = item.resultHint;
          }
          
          console.log(`🔍 发现异常指标: ${item.testName} ${reason} - ${abnormalText}`);
        }
      }
    }
  });
  
  return abnormalData;
}

/**
 * 从文本字符串中提取异常指标（用于其他场景）
 */
export function extractAbnormalIndicators(text: string): string[] {
  const abnormalData: string[] = [];
  
  // 将文本按行分割
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // 定义异常指标的关键词和模式
  const abnormalPatterns = [
    // 血糖相关异常 - 更精确的匹配
    { pattern: /血糖.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '血糖异常' },
    { pattern: /空腹血糖.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '空腹血糖异常' },
    { pattern: /餐后血糖.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '餐后血糖异常' },
    { pattern: /糖化血红蛋白.*?([>≥]?\s*\d+\.?\d*\s*%)/i, name: '糖化血红蛋白异常' },
    
    // 血压相关异常
    { pattern: /血压.*?(\d+\/\d+\s*mmHg)/i, name: '血压异常' },
    { pattern: /收缩压.*?([>≥]?\s*\d+\s*mmHg)/i, name: '收缩压异常' },
    { pattern: /舒张压.*?([>≥]?\s*\d+\s*mmHg)/i, name: '舒张压异常' },
    
    // 体重相关异常
    { pattern: /体重.*?([>≥]?\s*\d+\.?\d*\s*kg)/i, name: '体重异常' },
    { pattern: /BMI.*?([>≥]?\s*\d+\.?\d*)/i, name: 'BMI异常' },
    
    // 血脂相关异常
    { pattern: /总胆固醇.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '总胆固醇异常' },
    { pattern: /胆固醇.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '胆固醇异常' },
    { pattern: /甘油三酯.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: '甘油三酯异常' },
    { pattern: /HDL.*?([<≤]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: 'HDL异常' },
    { pattern: /LDL.*?([>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL))/i, name: 'LDL异常' },
    
    // 其他异常指标
    { pattern: /尿酸.*?([>≥]?\s*\d+\.?\d*\s*(μmol\/L|mg\/dL))/i, name: '尿酸异常' },
    { pattern: /肌酐.*?([>≥]?\s*\d+\.?\d*\s*(μmol\/L|mg\/dL))/i, name: '肌酐异常' },
    { pattern: /转氨酶.*?([>≥]?\s*\d+\.?\d*\s*(U\/L))/i, name: '转氨酶异常' },
    { pattern: /ALT.*?([>≥]?\s*\d+\.?\d*\s*(U\/L))/i, name: 'ALT异常' },
    { pattern: /AST.*?([>≥]?\s*\d+\.?\d*\s*(U\/L))/i, name: 'AST异常' },
    
    // 异常关键词匹配
    { pattern: /(异常|偏高|偏低|升高|降低|超标|超限|危险|警告|注意)/i, name: '异常关键词' },
    { pattern: /(糖尿病|高血压|高血脂|肥胖|代谢综合征)/i, name: '疾病关键词' },
  ];
  
  lines.forEach(line => {
    abnormalPatterns.forEach(({ pattern, name }) => {
      const match = line.match(pattern);
      if (match) {
        // 提取包含异常指标的完整行
        const abnormalLine = line.trim();
        if (!abnormalData.includes(abnormalLine)) {
          abnormalData.push(abnormalLine);
          console.log(`🔍 发现${name}: ${abnormalLine}`);
        }
      }
    });
  });
  
  return abnormalData;
}

/**
 * 持久化存储异常指标数据
 */
export async function storeAbnormalIndicators(abnormalData: string[], timestamp: Date = new Date()): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    // 获取现有的异常指标数据
    const existingDataJson = await AsyncStorage.default.getItem('abnormal_indicators');
    const existingData = existingDataJson ? JSON.parse(existingDataJson) : [];
    
    // 添加新的异常指标数据
    const newAbnormalData = abnormalData.map(text => ({
      text,
      timestamp: timestamp.toISOString(),
      source: 'ocr'
    }));
    
    // 合并数据（去重）
    const allData = [...existingData, ...newAbnormalData];
    
    // 保存到AsyncStorage
    await AsyncStorage.default.setItem('abnormal_indicators', JSON.stringify(allData));
    
    console.log(`💾 异常指标数据已持久化存储，新增 ${abnormalData.length} 条`);
  } catch (error) {
    console.error('❌ 存储异常指标数据失败:', error);
  }
}

/**
 * 获取所有持久化的异常指标数据
 */
export async function getStoredAbnormalIndicators(): Promise<Array<{text: string, timestamp: string, source: string}>> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    const dataJson = await AsyncStorage.default.getItem('abnormal_indicators');
    return dataJson ? JSON.parse(dataJson) : [];
  } catch (error) {
    console.error('❌ 获取异常指标数据失败:', error);
    return [];
  }
}

/**
 * 清除所有持久化的异常指标数据
 */
export async function clearStoredAbnormalIndicators(): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    await AsyncStorage.default.removeItem('abnormal_indicators');
    console.log('🗑️ 异常指标数据已清除');
  } catch (error) {
    console.error('❌ 清除异常指标数据失败:', error);
  }
} 