// 캐시 저장 파일


// 캐시 시스템을 관리하는 파일
interface CacheItem {
    data: any;  //저장할 데이터
    timestamp: number; // 저장된 시간
}

class CacheManager {
    private cache = new Map<string, CacheItem>();
    private ttl = 60 * 60 * 1000; // 1시간 (밀리초 단위) 


get(key: string): any | null {
    const item = this.cache.get(key);

    if(!item) {
        return null; // 캐시에 없음
     }

     //시간이 지났는지 확인
     if (Date.now() - item.timestamp > this.ttl) {
        this.cache.delete(key);
        return null;
     }
     
    console.log("캐시에서 결과 변환!", key);
    return item.data;
}
    
    //캐시에서 데이터 저장

    set(key: string, data: any): void {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        console.log("캐시에 데이터 저장", key);
    }

    //특정 캐시 삭제
    delete(key: string): void{
        this.cache.delete(key);
        console.log("캐시 삭제",key);        
    }

    //모든 캐시 삭제하기
    clear(): void{
        this.cache.clear();
        console.log("모든 캐시 삭제 완료");
    }

    //캐시 크기 확인하게
    size(): number {
        return this.cache.size;
    }
}


//다른 파일에서 사용할 수 있도록 내보내기
export const cacheManager = new CacheManager();

// 개발용: 브라우저 콘솔에서 접근 가능하게
if (typeof window !== 'undefined') {
    (window as any).cacheManager = cacheManager;
  }