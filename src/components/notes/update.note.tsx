import React, { useEffect, FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../LoadingButton";
import { toast } from "react-toastify";
import { trpc } from "../../utils/trpc";
import { INote } from "../../type";
import { useQueryClient } from "@tanstack/react-query";
import NoteModal from "../note.modal";

type IUpdateNoteProps = {
  note: INote;
  setOpenNoteModal: (open: boolean) => void;
};

const updateNoteSchema = object({
  title: string().min(1, "A title is necessary"),
  content: string().min(1, "A content is necessary"),
});

type UpdateNoteInput = TypeOf<typeof updateNoteSchema>;

const UpdateNote: FC<IUpdateNoteProps> = ({ note, setOpenNoteModal }) => {
  const queryClient = useQueryClient();
  const { isLoading, mutate: updateNote } = trpc.updateNote.useMutation({
    onSuccess() {
      queryClient.invalidateQueries([["getNotes"], { limit: 10, page: 1 }]);
      setOpenNoteModal(false);
      toast("note updated successfully", {
        type: "success",
        position: "top-right",
      });
    },
    onError(error) {
      setOpenNoteModal(false);
      toast(error.message, { type: "error", position: "top-right" });
    },
  });

  const methods = useForm<UpdateNoteInput>({
    resolver: zodResolver(updateNoteSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (note) {
      methods.reset(note);
    }
  }, []);

  const onSubmitHandler: SubmitHandler<UpdateNoteInput> = async (data) => {
    updateNote({ params: { noteId: note.id }, body: data });
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-ct-dark-600 font-semibold">
          {" "}
          Update Note
        </h2>
        <div
          onClick={() => setOpenNoteModal(false)}
          className="text-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center cursor-pointer"
        >
          <i className="bx bx-x"></i>
        </div>
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Title
          </label>
          <input
            className={twMerge(
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors["title"] && "border-red-500"}`
            )}
            {...methods.register("title")}
          />
          <p
            className={twMerge(
              `text-red-500 text-xs italic mb-2 invisible`,
              `${errors["title"] && "visible"}`
            )}
          >
            {errors["title"]?.message as string}
          </p>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Content
          </label>
          <textarea
            className={twMerge(
              `appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors.content ? "border-red-500" : "border-gray-400"}`
            )}
            rows={6}
            {...register("content")}
          />
          <p
            className={twMerge(
              "text-red-500 text-xs italic mb-2",
              `${errors.content ? "visible" : "invisible"}`
            )}
          >
            {errors.content && errors.content.message}
          </p>
        </div>
        <LoadingButton loading={isLoading}>Update Note</LoadingButton>
      </form>
    </section>
  );
};

export default UpdateNote;
