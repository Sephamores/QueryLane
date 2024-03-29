import Post from "@/components/post"
import { Box } from "@mui/system"
import Paper from "@mui/material/Paper"
import { useState, useEffect } from "react"
import TopBar from "@/components/topBar"
import style from "@/styles/post.module.css"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { useRouter } from "next/router"
import { backend } from "@/query.config"
import axios from "axios"
import { Typography } from "@mui/material"
import RichTextDialog from "@/components/richTextDialog"


axios.defaults.withCredentials = true


function FlexiblePost(props) {
    if (!props.post)
        return 
    return <Box>
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{ py: 1 }}
            // className={style.blue_bg}
        >
            {
                props.displayTitle && 
                <Paper
                    sx={{width: {xs: "95%", sm: "85%", md: "75%", lg: "65%", xl: "55%" }, p: 1, m:1}}
                    elevation={10}
                >
                    <Typography sx={{ wordBreak: "break-word" }} className={style.title} > 
                        {props.post.title}
                    </Typography>
                </Paper>
            }
            <Paper
                sx={{width: {xs: "95%", sm: "85%", md: "75%", lg: "65%", xl: "55%" }, pb: 0, minWidth: "min-content"}}
                elevation={10}
                className={style.comment_background}
            >
                <Post {...props} />
            </Paper>
        </Box>
        {/* <Divider component='div' sx={{ borderWidth: 1, width: {xs: "100%", sm: "90%", md: "80%", lg: "70%", xl: "60%" } }} /> */}
    </Box>
}


export default function Posts() {
    const router = useRouter();
    const {id} = router.query

    const [ isLoggedIn, setIsLoggedIn ] = useState(true)
    const [ username, setUsername ] = useState("abhinav")
    const [ userId, setUserId ] = useState("7498")
    const [ userDisplayName, setUserDisplayName ] = useState("Abhinav")
    const [ sortBy, setSortBy ] = useState("Score")
    const [ question, setQuestion ] = useState({})
    const [ answers, setAnswers ] = useState([])
    const [ dialogOpen, setDialogOpen] = useState(false)
    const [ post, setPost ] = useState("")
    const [ parentId, setParentId ] = useState(0)
    const [ refresh, setRefresh ] = useState(false)
    const [ editingId, setEditingId ] = useState(0)
    const [ action, setAction ] = useState("")
    const [ rteDefaultValue, setRteDefaultValue ] = useState("<p><br></p>")
    const [ tags, setTags ] = useState("")

    useEffect(() => {
        const setter = async () => {
          try {
            const data = (await axios.get(`${backend}/login`)).data;
            console.log(data);
            if (data.status == 'OK'){
              setIsLoggedIn(data.isLoggedIn);
              setUsername(data.username);
              setUserDisplayName(data.displayName);
              setUserId(data.userId);
            } else {
              setIsLoggedIn(false);
            }
          } catch (e) {
    
          }
        }
    
        setter();
    });

    const getQuestion = async (id) => {
        if (!id)
            return;
        try {
            const res = await axios.get(`${backend}/posts/getdata/${id}`)
            const data = res.data
            const res2 = await axios.get(`${backend}/comments/bypost/${id}`)
            const comments = res2.data;
            console.log(data[0])
            setQuestion({post: data[0], comments});
    
            const res3 = await axios.get(`${backend}/posts/getanswers/${id}`)
            const ans_ids = res3.data
            const id_str = ans_ids.join("&")
    
            const res4 = await axios.get(`${backend}/posts/getdata/${id_str}`)

            const answers = res4.data;

            const answerPosts = await Promise.all(answers.map(async (answer) => {
                const res2 = await axios.get(`${backend}/comments/bypost/${answer.id}`)
                const comments = await res2.data;
                return {post: answer, comments}
            }))
            console.log(answerPosts)
            if (sortBy == "score")
                setAnswers(answerPosts.sort((p1, p2) => {
                    p1.score < p2.score
                }))
            else {
                setAnswers(answerPosts.reverse())
            }
        } catch (e) {

        }
    }

    const answerPost = async (id) => {
        setDialogOpen(true)
        setParentId(id)
        setAction("answer")
        setRteDefaultValue("")
    }

    const editPost = async (id, data) => {
        setDialogOpen(true)
        setEditingId(id)
        setRteDefaultValue(data)
        setPost(data)
        setAction("edit")
    }

    const submit = async () => {
        const data = {
            owner_user_id: userId,
            owner_display_name: userDisplayName || "",
            body: post,
        }
        if (action == "answer"){
            data.post_type_id = '2';
            data.parent_id = parentId;
            data.tags=""
            const res = await axios.post(`${backend}/posts/create`, data);
        }
        if (action == "edit") {
            console.log(data)
            if (tags != "")
                data.tags = tags;
            setTags("")
            data.id = editingId;
            const res = await axios.patch(`${backend}/posts/update`, data)
            console.log("update ", res.data)
        }
        setDialogOpen(false)
        setRefresh(!refresh)
    }

    const submitComment = async (value, post_id) => {
        console.log(value, post_id)
        const data = {
            post_id,
            user_id: userId,
            user_display_name: userDisplayName || "",
            text: value
        }
        const res = await axios.post(`${backend}/comments/create`, data)
        setRefresh(!refresh)
    }

    const likePost = (post_id) => {
        console.log("like")
    }

    const dislikePost = (post_id) => {
        console.log("dislike")
    }

    useEffect(() => {
        try{
            getQuestion(id)
        } catch (e) {}
    }, [id, sortBy, refresh])

    // rte
    // const [dialogOpen, setDialogOpen] = useState(false);

    return (<>
        <TopBar isLoggedIn={isLoggedIn} username={username} userDisplayName={userDisplayName} userId={userId} setIsLoggedIn={setIsLoggedIn} />
        <Box display="flex" justifyContent="center" flexDirection="column" >
            <Box>
                <FlexiblePost likePost={likePost} dislikePost={dislikePost} submitComment={submitComment} displayTitle post={question.post} comments={question.comments} accepted_answer_id={456789} isLoggedIn={isLoggedIn} userId={userId} onAnswer={answerPost} onEdit={editPost} />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Paper
                    className={style.title}
                    sx={{width: {xs: "95%", sm: "85%", md: "75%", lg: "65%", xl: "55%" }, p: 1, m:1}}
                    elevation={10}
                >
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Box minWidth="max-content">
                            {answers.length} Answers    
                        </Box>
                        <Box flexGrow={1} />
                        <FormControl style={{minWidth: 120}}>
                            <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={sortBy}
                                label="SortBy"
                                onChange={(e) => {
                                    setSortBy(e.target.value)
                                }}
                            >
                                <MenuItem value={"Score"}>Score</MenuItem>
                                <MenuItem value={"Time"}>Time</MenuItem>
                                {/* <MenuItem value={"TimeDesc"}>Time (newest first)</MenuItem> */}
                            </Select>
                        </FormControl>
                        {/* <Box flexGrow={1} /> */}
                    </Box>
                </Paper>
            </Box>
            <Box>
                {
                    answers.map(({post, comments}) => (
                        <Box  key={post.id}>
                            <FlexiblePost likePost={likePost} dislikePost={dislikePost} key={post.id} post={post} comments={comments} submitComment={submitComment} accepted_answer_id={question.post.accepted_answer_id} isLoggedIn={isLoggedIn} userId={userId} onEdit={editPost} />
                        </Box>
                    ))
                }
            </Box>
        </Box>
        <RichTextDialog
            open={dialogOpen}
            onSubmit={submit}
            onCancel={() => {
                setDialogOpen(false);
            }}
            onChange={(value) => {
                setPost(value);
            }}
            defaultValue={rteDefaultValue}
            showTagSelector={ action == "edit" && editingId == id}
            onTagSelect={(value) => {
                setTags(value);
            }}
        />

    </>
    )
}