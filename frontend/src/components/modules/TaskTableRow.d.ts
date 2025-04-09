declare function TaskTableRow({ task, admin, refreshFunction }: {
    task: any;
    admin: boolean;
    refreshFunction: () => void;
}): import("react/jsx-runtime").JSX.Element;
export default TaskTableRow;
