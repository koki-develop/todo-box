import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskListItem from "@/components/model/task/TaskListItem";
import TaskNewListItem from "@/components/model/task/TaskNewListItem";
import { Task } from "@/models/task";
import { buildTask, separateTasks } from "@/lib/taskUtils";

export type TaskListProps = {
  projectId: string;
  sectionId: string | null;
  tasks: Task[];
  selectedTasks: Task[];

  onCompleteTask: (task: Task) => void;
  onIncompleteTask: (task: Task) => void;
  onCreateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const {
    projectId,
    sectionId,
    tasks,
    selectedTasks,
    onCompleteTask,
    onIncompleteTask,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [inputtingTask, setInputtingTask] = useState<boolean>(false);

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  const [completedTasks, incompletedTasks] = useMemo(() => {
    return separateTasks(tasks);
  }, [tasks]);

  const handleStartCreateTask = useCallback(() => {
    setInputtingTask(true);
  }, []);

  const handleCancelCreateTask = useCallback(() => {
    setInputtingTask(false);
  }, []);

  const handleCreateTask = useCallback(
    (title: string) => {
      setInputtingTask(false);
      const index =
        incompletedTasks.length === 0
          ? 0
          : incompletedTasks.slice(-1)[0].index + 1;
      const task = buildTask({
        projectId,
        sectionId,
        title,
        index,
      });
      onCreateTask(task);
    },
    [incompletedTasks, onCreateTask, projectId, sectionId]
  );

  // TODO: リファクタ
  return (
    <>
      <Droppable droppableId={droppableId} type="tasks">
        {(provided) => (
          <List
            ref={provided.innerRef}
            disablePadding
            sx={{ mb: 2 }}
            {...provided.droppableProps}
          >
            {incompletedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                selectedTasks={selectedTasks}
                onComplete={onCompleteTask}
                onIncomplete={onIncompleteTask}
                onDelete={onDeleteTask}
                onClick={onClickTask}
                onSelect={onSelectTask}
                onMultiSelect={onMultiSelectTask}
              />
            ))}
            {provided.placeholder}
            {inputtingTask ? (
              <TaskNewListItem
                onCreate={handleCreateTask}
                onCancel={handleCancelCreateTask}
              />
            ) : (
              <Button
                fullWidth
                startIcon={<AddIcon />}
                sx={{ justifyContent: "flex-start" }}
                onClick={handleStartCreateTask}
              >
                タスクを追加
              </Button>
            )}
          </List>
        )}
      </Droppable>
      <List disablePadding sx={{ mb: 2 }}>
        {completedTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            selectedTasks={selectedTasks}
            onComplete={onCompleteTask}
            onIncomplete={onIncompleteTask}
            onDelete={onDeleteTask}
            onClick={onClickTask}
            onSelect={onSelectTask}
            onMultiSelect={onMultiSelectTask}
          />
        ))}
      </List>
    </>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
