package laifu.fu.lai.services;

import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.Future;

@Service
public class AsyncServices implements IAsyncService
{
    @Override
    @Async
    public Future<String> asyncMethod()
    {
//        try {
//            Thread.sleep(5000);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
        return new AsyncResult<>("I am finished.");
    }
}
