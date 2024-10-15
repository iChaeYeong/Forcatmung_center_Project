import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Checkbox,
    Snackbar,
    Alert,
} from '@mui/material';

function AnimalManagement() {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('dog');
    const [age, setAge] = useState('');
    const [breed, setBreed] = useState('');
    const [description, setDescription] = useState('');
    const [gender, setGender] = useState('female');
    const [characteristics, setCharacteristics] = useState('');
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [priority, setPriority] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);

    useEffect(() => {
        fetchAnimals();
    }, []);

    const fetchAnimals = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/animals');
            setAnimals(response.data);
            setFilteredAnimals(response.data);
        } catch (error) {
            console.error('동물 목록 불러오기 중 오류 발생:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('species', species);
        formData.append('age', age);
        formData.append('breed', breed);
        formData.append('description', description);
        formData.append('gender', gender);
        formData.append('characteristics', characteristics);
        formData.append('mainImageIndex', mainImageIndex);
        formData.append('adoption_priority', priority ? 1 : 0);
        formData.append('existingImages', JSON.stringify(existingImages));
        images.forEach((image) => formData.append('images', image));

        const url = editingAnimal
            ? `http://localhost:5001/api/animals/${editingAnimal}`
            : 'http://localhost:5001/api/animals';

        const method = editingAnimal ? 'put' : 'post';

        try {
            const response = await axios({
                method,
                url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                setSuccessMessage(editingAnimal ? '동물 정보가 성공적으로 수정되었습니다.' : '동물 정보가 성공적으로 등록되었습니다.');
                resetForm();
                fetchAnimals();
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error(editingAnimal ? '동물 수정 중 오류 발생:' : '동물 등록 중 오류 발생:', error);
            alert('동물 정보 등록/수정 중 오류가 발생했습니다.'); // 사용자에게 오류 알림
        }
    };

    const resetForm = () => {
        setName('');
        setSpecies('dog');
        setAge('');
        setBreed('');
        setDescription('');
        setGender('female');
        setCharacteristics('');
        setImages([]);
        setExistingImages([]);
        setImagePreviews([]);
        setMainImageIndex(0);
        setPriority(false);
        setEditingAnimal(null);
    };

    const handleEdit = (animal) => {
        setName(animal.name);
        setSpecies(animal.species);
        setAge(animal.age);
        setBreed(animal.breed);
        setDescription(animal.description);
        setGender(animal.gender);
        setCharacteristics(animal.characteristics);
        setExistingImages(JSON.parse(animal.images || '[]')); // JSON 문자열에서 배열로 변환
        setMainImageIndex(animal.mainImageIndex);
        setEditingAnimal(animal.id);
        setPriority(animal.adoption_priority === 1);
    };

    const handleDelete = async (animalId) => {
        if (window.confirm('이 동물을 삭제하시겠습니까?')) {
            try {
                const response = await axios.delete(`http://localhost:5001/api/animals/${animalId}`);
                if (response.status === 200) {
                    alert('동물이 성공적으로 삭제되었습니다.');
                    fetchAnimals();
                }
            } catch (error) {
                console.error('동물 삭제 중 오류 발생:', error);
                alert('동물 삭제 중 오류가 발생했습니다.'); // 사용자에게 오류 알림
            }
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const previewUrls = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(previewUrls);
    };

    const handleMainImageSelect = (index) => {
        setMainImageIndex(index);
    };

    const handlePriorityChange = () => {
        setPriority(!priority);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div>
            <Box sx={{ padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    동물 관리
                </Typography>

                {/* AnimalForm */}
                <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="이름"
                                variant="outlined"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Select
                                label="종류"
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem value="dog">강아지</MenuItem>
                                <MenuItem value="cat">고양이</MenuItem>
                                <MenuItem value="other">기타</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="나이(개월)"
                                variant="outlined"
                                fullWidth
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="품종"
                                variant="outlined"
                                fullWidth
                                value={breed}
                                onChange={(e) => setBreed(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="설명"
                                variant="outlined"
                                multiline
                                rows={4}
                                fullWidth
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="특징"
                                variant="outlined"
                                fullWidth
                                value={characteristics}
                                onChange={(e) => setCharacteristics(e.target.value)}
                            />
                        </Grid>

                        {/* 우선순위 체크박스 */}
                        <Grid item xs={12}>
                            <Checkbox
                                checked={priority}
                                onChange={handlePriorityChange}
                                color="primary"
                            />
                            우선순위 설정
                        </Grid>

                        {/* 기존 이미지 미리보기 */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">기존 이미지</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {existingImages.map((image, index) => (
                                    <div key={index}>
                                        <img src={`http://localhost:5001${image}`} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                        <Checkbox
                                            checked={mainImageIndex === index}
                                            onChange={() => handleMainImageSelect(index)}
                                            color="primary"
                                        />
                                        대표 이미지
                                    </div>
                                ))}
                            </Box>
                        </Grid>

                        {/* 새 이미지 업로드 */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">새로운 이미지 업로드</Typography>
                            <input type="file" onChange={handleImageChange} multiple />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {imagePreviews.map((preview, index) => (
                                    <div key={index}>
                                        <img src={preview} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                        {editingAnimal ? '수정 완료' : '등록'}
                    </Button>
                </form>

                {/* AnimalList */}
                <Typography variant="h5" gutterBottom>
                    동물 목록
                </Typography>

                <Grid container spacing={3}>
                    {filteredAnimals.map((animal) => (
                        <Grid item xs={12} sm={6} md={4} key={animal.id}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={`http://localhost:5001${animal.mainImage}`}
                                    alt={animal.name}
                                />
                                <CardContent>
                                    <Typography variant="h6">{animal.name}</Typography>
                                    <Typography variant="body2">종류: {animal.species}</Typography>
                                    <Typography variant="body2">나이: {animal.age}개월</Typography>
                                    <Typography variant="body2">품종: {animal.breed}</Typography>
                                    <Typography variant="body2">설명: {animal.description}</Typography>
                                    {animal.adoption_priority === 1 && (
                                        <Typography variant="body2" color="secondary">
                                            우선순위
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => handleEdit(animal)} variant="contained" color="secondary">
                                        수정
                                    </Button>
                                    <Button onClick={() => handleDelete(animal.id)} variant="contained" color="error">
                                        삭제
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* 알림 Snackbar */}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default AnimalManagement;