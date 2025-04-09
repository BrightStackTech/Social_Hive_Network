declare function TaskInfoDialog({ task, admin, setOpen, refreshFunction }: {
    task: any;
    admin: boolean;
    setOpen: (value: boolean) => void;
    refreshFunction: () => void;
}): import("react/jsx-runtime").JSX.Element;
export default TaskInfoDialog;
