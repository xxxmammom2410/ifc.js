import { FC,useState } from "react";
import { TaskEntity } from "../../types/firestore-types";
import { getApp } from "firebase/app";
import { collection, getFirestore, onSnapshot,query, where } from "firebase/firestore";

import { useEffect } from "react";
import { useUserContext } from '../../user-provider';

export const TaskList: FC = () => {
  const [tasks, setTaskList] = useState<TaskEntity[]>([]);
  
  // データベースのインスタンスを取得
  const dbInstance = getFirestore(getApp());

  // ユーザー情報を取得
  const [user] =useUserContext();

  console.log(user?.uid);
  // pFAaVTNX5QWLGyTPO3YsXIvDzOv2
  // pFAaVTNX5QWLGyTPO3YsXIvDzOv2

  // クエリを作成(コレクション名はtasksを指定)
  // Query関数での束縛は指定なし
  // const q = query(collection(dbInstance, "tasks"));
  const q = query(collection(dbInstance, "tasks"),
   where("userID", "==", user?.uid));

  useEffect(() => {
    // QuerySnapshotへのリスナーを登録
    // データベースのデータ変更時に配信されるsnapshotを受け取る
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: TaskEntity[] = [];
      snapshot.forEach((doc) => {
        result.push({
          // クエリの結果をTaskEntity型にキャストして
          ...(doc.data() as TaskEntity),
        });
      });
      setTaskList(result);
      });

      return () => {
        unsubscribe();
      }
  }, []);
    


  return (

    <div>
      {Boolean(tasks.length) ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.uid}>{task.title}</li>
          ))}
        </ul>
      ) : (
        <p>No tasks</p>
      )}
    </div>
  );
};